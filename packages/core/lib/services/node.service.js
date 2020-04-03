/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { omit } = require('fachwork')

module.exports = {
  name: '$node',
  actions: {
    services: {
      params: {
        withActions: { type: 'boolean', optional: true },
        withNodeService: { type: 'boolean', optional: true }
      },
      handler (context) {
        const { withActions, withNodeService } = context.params
        const results = []
        const services = this.broker.registry.services.list({ withActions, withNodeService })
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
        return this.broker.registry.getActionList(context.params)
      }
    },
    events: {
      handler (context) {
        return this.broker.registry.events.list(context.params)
      }
    },
    health: {
      handler () {
        return this.broker.health.getNodeHealthInfo()
      }
    },
    list: {
      handler (context) {
        return this.broker.registry.getNodeList(context.params)
      }
    }
  }
}
