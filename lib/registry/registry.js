/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

'use strict'

const NodeCatalog = require('./node-catalog')
const ServiceCatalog = require('./service-catalog')
const ActionCatalog = require('./action-catalog')
const EventCatalog = require('./event-catalog')

const MakeRegistry = ({ state, getLogger, bus, middlewareHandler, Errors }) => {
    const self = Object.create({})

    self.log = getLogger('REGISTRY')
    self.nodes = NodeCatalog({ registry: self, log: self.log, state, bus })
    self.services = ServiceCatalog({ registry: self, log: self.log, state })
    self.actions = ActionCatalog({ registry: self, log: self.log, state })
    self.events = EventCatalog({ registry: self, log: self.log, state })
    self.getTransport = () => {}

    function checkActionVisibility (action, node) {
        if (typeof action.visibility === 'undefined' || action.visibility === 'public') {
            return true
        }
        if (action.visibility === 'protected' && node.local) {
            return true
        }
        return false
    }

    self.registerLocalService = (svc) => {
        const service = self.services.add(self.nodes.localNode, svc.name, svc.version, svc.settings)

        if (svc.actions) {
            self.registerActions(self.nodes.localNode, service, svc.actions)
        }
        if (svc.events) {
            self.registerEvents(self.nodes.localNode, service, svc.events)
        }

        self.nodes.localNode.services.push(service)

        if (svc.version) {
            self.log.info(`'${service.name}' service (v${svc.version}) registered.`)
        } else {
            self.log.info(`'${service.name}' service registered.`)
        }
    }

    self.registerServices = (node, services) => {
        services.forEach((service) => {
            // todo: handle events
            let oldActions
            let svc = self.services.get(node, service.name, service.version)
            if (!svc) {
                svc = self.services.add(node, service.name, service.version)
            } else {
                oldActions = Object.assign({}, svc.actions)
                svc.update(service)
            }

            if (service.actions) {
                self.registerActions(node, svc, service.actions)
            }

            if (service.events) {
                self.registerEvents(node, svc, service.events)
            }

            if (oldActions) {
                // this.unregisterAction()
                Object.keys(oldActions).forEach(key => {
                    // const action = oldActions[key]
                    if (!service.actions[key]) {
                        /*
                        function unregisterAction (nodeId, action) {
                            if (actions.has(action.name)) {
                                const list = actions.get(action.name)
                                if (list) {
                                    list.removeByNodeId(nodeId)
                                }
                            }
                        }*/
                    }
                })
            }

            if (svc.version) {
                self.log.info(`${service.name} service (v${svc.version}) registered.`)
            } else {
                self.log.info(`${service.name} service registered.`)
            }
        })

        // remove old services
        self.services.services.forEach((service) => {
            if (service.node !== node) return

            let isExisting = false
            services.forEach((svc) => {
                if (service.equals(svc.name, svc.version)) {
                    isExisting = true
                }
            })

            if (!isExisting) {
                self.unregisterService(service.name, service.version, node.id)
            }
        })
    }

    self.unregisterServiceByNodeId = (nodeId) => self.services.removeAllByNodeId(nodeId)

    self.unregisterService = (name, version, nodeId) => self.services.remove(nodeId || state.nodeId, name, version)

    self.registerActions = (node, service, actions) => {
        Object.keys(actions).forEach((key) => {
            const action = actions[key]

            if (!checkActionVisibility(action, node)) {
                return
            }

            const transport = self.getTransport()
            if (node.local) {
                action.handler = middlewareHandler.wrapHandler('localAction', action.handler, action)
            } else {
                action.handler = middlewareHandler.wrapHandler('remoteAction', transport.request.bind(transport), action)
            }

            self.actions.add(node, service, action)
            service.addAction(action)
        })
    }

    self.unregisterAction = (node, action) => {

    }

    self.registerEvents = (node, service, events) => {
        Object.keys(events).forEach((key) => {
            const event = events[key]
            self.events.add(node, service, event)
            service.addEvent(event)
        })
    }

    self.getActionEndpointByNodeId = (actionName, nodeId) => {
        const endpointList = self.actions.get(actionName)
        if (endpointList) {
            return endpointList.getByNodeId(nodeId)
        }
    }

    self.getNextAvailableActionEndpoint = (actionName, opts = {}) => {
        if (typeof actionName !== 'string') {
            return actionName
        } else {
            if (opts && opts.nodeId) { // remote
                const endpoint = self.getActionEndpointByNodeId(actionName, opts.nodeId)
                if (!endpoint) {
                    self.log.warn(`Service ${actionName} is not registered on node ${opts.nodeId}.`)
                    return new Errors.WeaveServiceNotFoundError(actionName)
                }
            } else {
                const endpointList = self.getActionEndpoints(actionName)
                if (!endpointList) {
                    self.log.warn(`Service ${actionName} is not registered.`)
                    return new Errors.WeaveServiceNotFoundError(actionName)
                }
                const endpoint = endpointList.getNextAvailable()
                if (!endpoint) {
                    self.log.warn(`Service ${actionName} is not available.`)
                    return new Errors.WeaveServiceNotFoundError(actionName)
                }
                return endpoint
            }
        }
    }

    self.getActionEndpoints = actionName => self.actions.get(actionName)

    self.getLocalActionEndpoint = actionName => {
        const endpointList = self.getActionEndpoints(actionName)
        if (!endpointList) {
            self.log.warn(`Service ${actionName} is not registered localy.`)
            throw new Errors.WeaveServiceNotFoundError(actionName)
        }
        const endpoint = endpointList.getNextLocalEndpoint()
        if (!endpoint) {
            self.log.warn(`Service ${actionName} is not available localy.`)
            throw new Errors.WeaveServiceNotFoundError(actionName)
        }
        return endpoint
    }

    self.hasService = (serviceName, version, nodeId) => self.services.has(serviceName, version, nodeId)

    self.getLocalNodeInfo = () => {
        const { client, IPList } = self.nodes.localNode
        const services = self.services.list({
            localOnly: true,
            withActions: true,
            withEvents: true,
            withInternalActions: state.options.internalActionsAccessable,
            withSettings: false
        })

        return { client, IPList, services }
    }

    self.getNodeList = options => self.nodes.list(options)

    self.getServiceList = options => self.services.list(options)

    self.getEventList = options => self.events.list(options)

    self.getActionList = options => self.actions.list(options)

    return self
}

module.exports = MakeRegistry
