/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const EndpointList = require('./endpoint-list')
const { omit, forIn, remove } = require('lodash')
const ServiceItem = require('./service-item')
// const { ROUND_ROBIN } = require('../constants.js')

const MakeServiceCatalog = ({ state, registry }) => {
    const self = Object.create(null)
    const services = self.services = []
    const actions = new Map()
    const options = state.options

    self.add = (node, name, version, settings) => {
        const item = ServiceItem(node, name, version, settings, node.id === state.nodeId)
        services.push(item)
        return item
    }

    self.get = (nodeId, name, version, settings) => services.find(svc => svc.equals(name, version, nodeId))

    self.has = (name, version, nodeId) => !!services.find(svc => svc.equals(name, version, nodeId))

    self.remove = (nodeId, name, version) => {
        const service = self.get(nodeId, name, version)
        if (service) {
            registry.actions.removeByService(service)
            registry.events.removeByService(service)
            remove(services, svc => svc === service)
        }
    }

    self.removeAllByNodeId = (nodeId) => {
        remove(services, service => {
            if (service.node.id === nodeId) {
                registry.actions.removeByService(service)
                registry.events.removeByService(service)
                return true// services.splice(services.indexOf(service), 1)
            }
            return false
        })
    }

    self.registerAction = (nodeId, action) => {
        let endPointList = actions.get(action.name)
        if (!endPointList) {
            endPointList = EndpointList(state, options)
            endPointList.internal = action.name.substring(0, 1) === '$'
            actions.set(action.name, endPointList)
        }
        const service = findServiceByNode(nodeId, action.service.name)
        if (service) {
            service.addAction(action)
        }
        return endPointList.add(nodeId, action)
    }

    self.tryFindActionsByActionName = (actionName) => {
        return actions.get(actionName)
    }

    self.getLocalActions = () => {
        const result = []
        // todo: refactoring to array.map()
        actions.forEach((entry, key) => {
            const endpoint = entry.getLocalEndpoint()
            if (endpoint) result.push(omit(endpoint.action, ['service', 'handler']))
        })
        return result
    }

    self.getActionsList = () => {
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

    self.list = ({ localOnly = false, withActions = false, withEvents = false, withInternalActions = false, withSettings = false }) => {
        const result = []
        services.forEach((service) => {
            if (/^\$node/.test(service.name) && !withInternalActions) {
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
                forIn(service.actions, action => {
                    item.actions[action.name] = omit(action, ['handler', 'service'])
                })
            }

            if (withEvents) {
                item.events = {}
                forIn(service.events, event => {
                    item.events[event.name] = omit(event, ['service', 'handler'])
                })
            }
            result.push(item)
        })
        return result
    }

    self.findEndpointByNodeId = (actionName, nodeId) => {
        const endpointListItem = self.tryFindActionsByActionName(actionName)
        if (endpointListItem) {
            return endpointListItem.endpointByNodeId(nodeId)
        }
    }

    return self

    function findServiceByNode (nodeId, name) {
        return services.find(service => service.name === name && service.nodeId === nodeId)
    }
}

module.exports = MakeServiceCatalog
