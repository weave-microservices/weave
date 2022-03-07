/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
*/

const { omit } = require('../../../core/utils/lib')

exports.name = '$node'

exports.actions = {
  services: {
    params: {
      withActions: { type: 'boolean', optional: true },
      withNodeService: { type: 'boolean', optional: true }
    },
    handler (context) {
      const { withActions, withNodeService } = context.data
      const services = this.runtime.registry.serviceCollection.list({ withActions, withNodeService })
      const servicesFound = []

      services.forEach(service => {
        let item = servicesFound.find(result => result.name === service.name && result.version === service.version)

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
          servicesFound.push(item)
        }
      })
      return servicesFound
    }
  },
  actions: {
    handler (context) {
      return this.runtime.registry.actionCollection.list(context.data)
    }
  },
  events: {
    handler (context) {
      return this.runtime.registry.eventCollection.list(context.data)
    }
  },
  list: {
    handler (context) {
      return this.runtime.registry.nodeCollection.list(context.data)
    }
  }
}
