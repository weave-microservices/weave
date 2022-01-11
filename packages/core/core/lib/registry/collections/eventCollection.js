// @ts-check

/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
*/

/**
 * @typedef {import('../../types.js').Registry} Registry
 * @typedef {import('../../types.js').EventCollection} EventCollection
 * @typedef {import('../../types.js').Service} Service
 * @typedef {import('../../types.js').Node} Node
 * @typedef {import('../../types.js').EndpointCollection} EndpointCollection
*/

const { omit, match } = require('@weave-js/utils')
const { createEndpointList } = require('./endpointCollection')

const broadcastEvents = ['broadcast', 'localBroadcast']
/**
 * Create event collection
 * @param {Registry} registry Registy reference
 * @return {EventCollection} Event collection
 */
exports.createEventCollection = (registry) => {
  const eventCollection = Object.create(null)
  const { runtime } = registry
  const events = [] // todo: refactor to js Map
  const getAllEventsByEventName = (eventName) => events.filter(list => match(eventName, list.name))

  /**
   * Add node to collection
   * @param {Node} node Node
   * @param {Service} service Service
   * @param {any} event Event
   * @return {EndpointCollection} Endpoint collection
  */
  eventCollection.add = (node, service, event) => {
    const groupName = event.group || service.name
    let endpointList = eventCollection.get(event.name, groupName)
    if (!endpointList) {
      endpointList = createEndpointList(runtime, event.name, groupName)
      events.push(endpointList)
    }
    return endpointList.add(node, service, event)
  }

  eventCollection.get = (eventName, groupName) => {
    return events.find(endpointList => endpointList.name === eventName && endpointList.groupName === groupName)
  }

  eventCollection.remove = (node, eventName) => {
    events.map(list => {
      if (list.name === eventName) {
        list.removeByNodeId(node.id)
      }
    })
  }

  eventCollection.removeByService = (service) => {
    events.map(list => {
      list.removeByService(service)
    })
  }

  eventCollection.getBalancedEndpoints = (eventName, groups) => {
    const result = []
    getAllEventsByEventName(eventName)
      .forEach(endpointList => {
        if (groups == null || groups.length === 0 || groups.indexOf(endpointList.groupName) !== -1) {
          const endpoint = endpointList.getNextAvailableEndpoint()
          if (endpoint && endpoint.isAvailable()) {
            result.push([endpoint, endpointList.groupName])
          }
        }
      })
      // .filter(endpointList => (groups == null || groups.length === 0 || groups.includes(endpointList.groupName)))
      // .map(endpointList => ({ endpoint: endpointList.getNextAvailableEndpoint(), endpointList }))
      // .filter(({ endpoint }) => endpoint && endpoint.isAvailable())
      // .map(({ endpoint, endpointList }) => [endpoint, endpointList.groupName])
    return result
  }

  eventCollection.getAllEndpoints = (eventName) => {
    return getAllEventsByEventName(eventName)
      .map(list => list.endpoints)
      .map(endpoints => endpoints.filter(endpoint => endpoint.isAvailable()))
      .reduce((prev, curr) => prev.concat(curr))
  }

  eventCollection.getAllEndpointsUniqueNodes = (eventName, groups) => {
    let endpoints = getAllEventsByEventName(eventName)
      .filter(endpointList => (groups == null || groups.length === 0 || groups.includes(endpointList.groupName)))
      .map(endpointList => endpointList.endpoints)

    if (endpoints.length > 0) {
      endpoints = endpoints.reduce((prev, curr) => prev.concat(curr))
    }

    const unique = {}
    const distinct = []

    for (const i in endpoints) {
      if (typeof (unique[endpoints[i].node.id]) === 'undefined') {
        distinct.push(endpoints[i])
      }
      unique[endpoints[i].node.id] = endpoints[i].node.id
    }

    return distinct
  }

  eventCollection.emitLocal = (context) => {
    const promises = []
    const groups = context.eventGroups
    const isBroadcast = broadcastEvents.includes(context.eventType)

    getAllEventsByEventName(context.eventName)
      .filter(endpointList => (groups == null || groups.length === 0 || groups.includes(endpointList.groupName)))
      .map(list => {
        if (isBroadcast) {
          list.endpoints.map(endpoint => {
            if (endpoint.isLocal && endpoint.action.handler) {
              promises.push(endpoint.action.handler(context))
            }
          })
        } else {
          const endpoint = list.getNextLocalEndpoint()
          if (endpoint && endpoint.isLocal && endpoint.action.handler) {
            promises.push(endpoint.action.handler(context))
          }
        }
      })

    return Promise.all(promises)
  }

  eventCollection.list = ({ onlyLocals = false, skipInternals = false, withEndpoints = false } = {}) => {
    const result = []

    events.forEach(list => {
      if (skipInternals && /^\$node/.test(list.name)) {
        return
      }

      if (onlyLocals && !list.hasLocal()) {
        return
      }

      const item = {
        name: list.name,
        hasAvailable: list.hasAvailable(),
        groupName: list.groupName,
        hasLocal: list.hasLocal(),
        count: list.count()
      }

      if (item.count > 0) {
        const endpoint = list.endpoints[0]
        if (endpoint) {
          item.event = omit(endpoint.action, ['handler', 'service'])
        }
      }

      if (withEndpoints) {
        item.endpoints = list.endpoints.map(endpoint => {
          return {
            nodeId: endpoint.node.id,
            state: endpoint.state
          }
        })
      }
      result.push(item)
    })
    return result
  }

  return eventCollection
}
