/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { createEndpointCollection } = require('./endpoint-collection')
const { omit, remove } = require('@weave-js/utils')
const { createServiceItem } = require('../service-item')

exports.createServiceCollection = (registry) => {
  const serviceCollection = Object.create(null)
  const broker = registry.broker
  const services = serviceCollection.services = []
  const actions = new Map()
  const options = broker.options

  const findServiceByNode = (nodeId, name) => {
    return services.find(service => service.name === name && service.nodeId === nodeId)
  }

  serviceCollection.add = (node, name, version, settings) => {
    const item = createServiceItem(node, name, version, settings, node.id === broker.nodeId)
    services.push(item)
    return item
  }

  serviceCollection.get = (nodeId, name, version) => services.find(svc => svc.equals(name, version, nodeId))

  serviceCollection.has = (name, version, nodeId) => {
    return !!services.find(svc => svc.equals(name, version, nodeId))
  }

  serviceCollection.remove = (nodeId, name, version) => {
    const service = serviceCollection.get(nodeId, name, version)

    if (service) {
      registry.actions.removeByService(service)
      registry.events.removeByService(service)
      remove(services, svc => svc === service)
    }
  }

  serviceCollection.removeAllByNodeId = (nodeId) => {
    remove(services, service => {
      if (service.node.id === nodeId) {
        registry.actions.removeByService(service)
        registry.events.removeByService(service)
        return true
      }
      return false
    })
  }

  serviceCollection.registerAction = (nodeId, action) => {
    let endPointList = actions.get(action.name)

    if (!endPointList) {
      endPointList = createEndpointCollection(broker, options)
      endPointList.isInternal = action.name.substring(0, 1) === '$'
      actions.set(action.name, endPointList)
    }

    const service = findServiceByNode(nodeId, action.service.name)

    if (service) {
      service.addAction(action)
    }

    return endPointList.add(nodeId, action)
  }

  serviceCollection.tryFindActionsByActionName = (actionName) => actions.get(actionName)

  serviceCollection.getLocalActions = () => {
    const result = []
    // todo: refactoring to array.map()
    actions.forEach(entry => {
      const endpoint = entry.getLocalEndpoint()
      if (endpoint) {
        result.push(omit(endpoint.action, ['service', 'handler']))
      }
    })
    return result
  }

  serviceCollection.getActionsList = () => {
    const result = []
    actions.forEach((action, key) => {
      const item = {
        name: key,
        count: action.count(),
        hasLocal: action.hasLocal()
      }
      result.push(item)
    })
    return result
  }

  serviceCollection.list = ({ localOnly = false, withActions = false, withEvents = false, withNodeService = false, withSettings = false }) => {
    const result = []
    services.forEach((service) => {
      if (/^\$node/.test(service.name) && !withNodeService) {
        return
      }
      if (service.settings && service.settings.$private) {
        return
      }

      if (localOnly && !service.isLocal) {
        return
      }

      const item = {
        name: service.name,
        nodeId: service.node.id,
        version: service.version,
        isAvailable: service.node.isAvailable
      }

      if (withSettings) {
        item.settings = service.settings
      }

      if (withActions) {
        item.actions = {}
        Object.values(service.actions)
          .forEach(action => {
            item.actions[action.name] = omit(action, ['handler', 'service'])
          })
      }

      if (withEvents) {
        item.events = {}
        Object.values(service.events)
          .forEach(event => {
            item.events[event.name] = omit(event, ['service', 'handler'])
          })
      }

      result.push(item)
    })
    return result
  }

  serviceCollection.findEndpointByNodeId = (actionName, nodeId) => {
    const endpointListItem = serviceCollection.tryFindActionsByActionName(actionName)
    if (endpointListItem) {
      return endpointListItem.endpointByNodeId(nodeId)
    }
  }

  return serviceCollection
}
