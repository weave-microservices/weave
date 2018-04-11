const { omit } = require('fachwork')
const { getNodeHealthInfo } = require('./health')

module.exports = {
    name: '$node',
    actions: {
        services: {
            handler (context) {
                const results = []
                const services = this.broker.registry.getServiceList({ withActions: true })
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
                return this.broker.registry.getEventList(context.params)
            }
        },
        health: {
            handler (context) {
                return getNodeHealthInfo(this.weave)
            }
        },
        list: {
            handler (context) {
                return this.broker.registry.getNodeList(context.params)
            }
        },
        stats: {
            handler (context) {
                if (this.weave.options.statistics) {
                    return this.broker.statistics.getSnapshot()
                } else {
                    return Promise.reject(new Error('Statistics are not enabled.'))
                }
            }
        }
    }
}
