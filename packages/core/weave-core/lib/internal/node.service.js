/* istanbul ignore file */
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
*/

const { omit } = require('@weave-js/utils')

exports.name = '$node'

exports.actions = {
  services: {
    params: {
      withActions: { type: 'boolean', optional: true },
      withNodeService: { type: 'boolean', optional: true }
    },
    handler (context) {
      const { withActions, withNodeService } = context.data
      const results = []
      const services = this.runtime.registry.serviceCollection.list({ withActions, withNodeService })

      services.forEach(service => {
        let item = results.find(result => result.name === service.name && result.version === service.version)

        if (item) {
          item.nodes.push(service.nodeId)
          if (service.actions) {
            item.actions = {}
            Object.keys(service.actions).forEach(actionName => {
              const action = service.actions[actionName]
              if (!item.actions[actionName]) {
                item.actions[actionName] = omit(action, ['handler', 'service'])
              }
            })
          }
        } else {
          item = {
            name: service.name,
            version: service.version
          }
          item.nodes = [service.nodeId]
          if (service.actions) {
            item.actions = {}
            Object.keys(service.actions).forEach(actionName => {
              const action = service.actions[actionName]
              item.actions[actionName] = omit(action, ['handler', 'service'])
            })
          }
          results.push(item)
        }
      })
      return results
    }
  },
  actions: {
    handler (context) {
      return this.runtime.registry.getActionList(context.data)
    }
  },
  events: {
    handler (context) {
      return this.runtime.registry.eventCollection.list(context.data)
    }
  },
  health: {
    handler () {
      return this.runtime.health.getNodeHealthInfo()
    }
  },
  list: {
    handler (context) {
      return this.runtime.registry.getNodeList(context.data)
    }
  }
}
