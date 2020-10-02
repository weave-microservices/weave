/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { omit } = require('@weave-js/utils')
const { createEndpointList } = require('./endpoint-collection')

/**
 * Configuration object for weave service broker.
 * @typedef {Object} ActionCollection
 * @property {Function} add Enable metric middleware. (default = false)
 * @property {Array<String|Object>} adapters Array of metric adapters.
 */

/**
 * Create an action collection.
 * @param {any} registry Reference to the registry.
 * @returns {ActionCollection} Action collection
 */
exports.createActionCollection = (registry) => {
  const broker = registry.broker
  const actions = new Map()

  return {
    add (node, service, action) {
      let endPointList = actions.get(action.name)
      if (!endPointList) {
        endPointList = createEndpointList(broker, action.name)
        actions.set(action.name, endPointList)
      }
      return endPointList.add(node, service, action)
    },
    get (actionName) {
      return actions.get(actionName)
    },
    removeByService (service) {
      actions.forEach(list => {
        list.removeByService(service)
      })
    },
    remove (actionName, node) {
      const endpoints = actions.get(actionName)
      if (endpoints) {
        endpoints.removeByNodeId(node.id)
      }
    },
    list ({ onlyLocals = false, skipInternals = false, withEndpoints = false }) {
      const result = []
      actions.forEach(action => {
        if (skipInternals && /^\$node/.test(action.name)) {
          return
        }

        if (onlyLocals && !action.hasLocal()) {
          return
        }

        const item = {
          name: action.name,
          hasAvailable: action.hasAvailable(),
          hasLocal: action.hasLocal(),
          count: action.count(),
          params: action.params
        }

        if (item.count > 0) {
          const endpoint = action.endpoints[0]
          if (endpoint) {
            item.action = omit(endpoint.action, ['handler', 'service'])
          }
        }
        if (item.action == null || item.action.protected) {
          return
        }

        if (withEndpoints) {
          item.endpoints = action.endpoints.map(endpoint => {
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
  }
}
