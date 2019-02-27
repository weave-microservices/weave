/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

// own packages
const MakeNodeCollection = require('./collections/node-collection')
const MakeServiceCollection = require('./collections/service-collection')
const MakeActionCollection = require('./collections/action-collection')
const MakeEventCollection = require('./collections/event-collection')
const Endpoint = require('./endpoint')
const EventEmitterMixin = require('../utils/event-emitter-mixin')
const { WeaveServiceNotFoundError } = require('../errors')
const Node = require('./node')

const createRegistry = (middlewareHandler) => {
    const self = Object.assign({}, EventEmitterMixin())
    const noop = () => {}
    // self.log = createLogger('REGISTRY')
    // self.nodes = MakeNodeCollection({ registry: self, log: self.log, state, bus, Node })
    // self.services = MakeServiceCollection({ registry: self, log: self.log, state })
    // self.actions = MakeActionCollection({ registry: self, log: self.log, state })
    // self.events = MakeEventCollection({ registry: self, log: self.log, state })

    const checkActionVisibility = (action, node) => {
        if (typeof action.visibility === 'undefined' || action.visibility === 'public') {
            return true
        }
        if (action.visibility === 'protected' && node.isLocal) {
            return true
        }
        return false
    }

    // Services
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

    self.unregisterServiceByNodeId = nodeId => self.services.removeAllByNodeId(nodeId)

    self.unregisterService = (name, version, nodeId) => self.services.remove(nodeId || state.nodeId, name, version)

    // self.hasService = (serviceName, version, nodeId) => self.services.has(serviceName, version, nodeId)

    self.getServiceList = options => self.services.list(options)

    // Actions
    // self.registerActions = (node, service, actions) => {
    //     Object.keys(actions).forEach((key) => {
    //         const action = actions[key]

    //         if (!checkActionVisibility(action, node)) {
    //             return
    //         }

    //         const transport = self.getTransport()
    //         if (node.isLocal) {
    //             action.handler = middlewareHandler.wrapHandler('localAction', action.handler, action)
    //         } else {
    //             action.handler = middlewareHandler.wrapHandler('remoteAction', transport.request.bind(transport), action)
    //         }

    //         self.actions.add(node, service, action)
    //         service.addAction(action)
    //     })
    // }

    self.unregisterAction = (node, action) => {

    }

    self.getActionList = options => self.actions.list(options)

    // Events
    self.registerEvents = (node, service, events) => {
        Object.keys(events).forEach((key) => {
            const event = events[key]
            self.events.add(node, service, event)
            service.addEvent(event)
        })
    }

    self.getEventList = options => self.events.list(options)

    // Endpoints
    self.createPrivateEndpoint = (action) => {
        return Endpoint(state, self.nodes.localNode, action.service, action)
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

    self.processNodeInfo = payload => {
        const nodeId = payload.sender
        let node = self.nodes.get(nodeId)
        let isNew = false
        let isReconnected = false

        // There is no node with the specified ID. It must therefore be a new node.
        if (!node) {
            isNew = true
            node = new Node(nodeId)
            self.nodes.add(nodeId, node)
        } else if (!node.isAvailable) {
            // Node exists, but is marked as unavailable. It must therefore be a reconnected node.
            isReconnected = true
            node.isAvailable = true
            node.lastHeartbeatTime = Date.now()
        }

        // todo: Handle multiple nodes with the same ID.

        const updateNesesary = node.update(payload, isReconnected)

        if (updateNesesary && node.services) {
            self.registerServices(node, node.services)
        }

        if (isNew) {
            self.emit('node.connected', { node, isReconnected })
            self.log.info(`Node ${node.id} connected!`)
        } else if (isReconnected) {
            self.emit('node.connected', { node, isReconnected })
            self.log.info(`Node ${node.id} reconnected!`)
        } else {
            self.emit('node.updated', { node, isReconnected })
            self.log.info(`Node ${node.id} updated!`)
        }
    }

    self.nodeDisconnected = (nodeId, isUnexpected) => {
        const node = self.nodes.get(nodeId)
        if (node && node.isAvailable) {
            self.unregisterServiceByNodeId(node.id)
            node.disconnected(isUnexpected)
            self.emit('node.disconnected', nodeId, isUnexpected)
            self.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`)
        }
    }

    self.generateLocalNodeInfo = incrementSequence => {
        const { client, IPList, sequence } = self.nodes.localNode
        const nodeInfo = { client, IPList, sequence }

        if (incrementSequence) {
            self.nodes.localNode.sequence++
        }

        if (broker.isStarted) {
            nodeInfo.services = self.services.list({
                localOnly: true,
                withActions: true,
                withEvents: true,
                withInternalActions: broker.options.internalActionsAccessable,
                withSettings: true
            })
        } else {
            nodeInfo.services = []
        }

        self.nodes.localNode.info = nodeInfo
        return nodeInfo
    }

    self.getLocalNodeInfo = forceGenerateInfo => {
        if (forceGenerateInfo || !self.nodes.localNode.info) {
            return self.generateLocalNodeInfo()
        }

        return self.nodes.localNode.info
    }

    self.getNodeList = options => self.nodes.list(options)

    // registry object
    const registry = {
        init (broker) {
            this.broker = broker
            // this.transport = transport
            this.middlewareHandler = middlewareHandler

            // create logger
            this.log = broker.createLogger('REGISTRY')

            // create collections
            this.nodes = MakeNodeCollection(this)
            this.services = MakeServiceCollection(this)
            this.actions = MakeActionCollection(this)
            this.events = MakeEventCollection(this)
        },
        onRegisterLocalAction: noop,
        onRegisterRemoteAction: noop,
        checkActionVisibility (action, node) {
            if (typeof action.visibility === 'undefined' || action.visibility === 'public') {
                return true
            }
            if (action.visibility === 'protected' && node.isLocal) {
                return true
            }
            return false
        },
        registerLocalService (svc) {
            const service = this.services.add(this.nodes.localNode, svc.name, svc.version, svc.settings)

            if (svc.actions) {
                this.registerActions(this.nodes.localNode, service, svc.actions)
            }
            if (svc.events) {
                this.registerEvents(this.nodes.localNode, service, svc.events)
            }

            this.nodes.localNode.services.push(service)

            if (svc.version) {
                this.log.info(`'${service.name}' service (v${svc.version}) registered.`)
            } else {
                this.log.info(`'${service.name}' service registered.`)
            }
        },
        registerEvents (node, service, events) {
            Object.keys(events).forEach((key) => {
                const event = events[key]
                this.events.add(node, service, event)
                service.addEvent(event)
            })
        },
        registerActions (node, service, actions) {
            Object.keys(actions).forEach((key) => {
                const action = actions[key]

                if (!this.checkActionVisibility(action, node)) {
                    return
                }

                if (node.isLocal) {
                    action.handler = this.onRegisterLocalAction(action)
                } else {
                    action.handler = this.onRegisterRemoteAction(action)
                }

                this.actions.add(node, service, action)
                service.addAction(action)
            })
        },
        getActionList (options) {
            return this.actions.list(options)
        },
        registerServices (node, services) {
            services.forEach((service) => {
                // todo: handle events
                let oldActions
                let svc = this.services.get(node, service.name, service.version)
                if (!svc) {
                    svc = this.services.add(node, service.name, service.version)
                } else {
                    oldActions = Object.assign({}, svc.actions)
                    svc.update(service)
                }

                if (service.actions) {
                    this.registerActions(node, svc, service.actions)
                }

                if (service.events) {
                    this.registerEvents(node, svc, service.events)
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
                    this.log.info(`${service.name} service (v${svc.version}) registered.`)
                } else {
                    this.log.info(`${service.name} service registered.`)
                }
            })

            // remove old services
            this.services.services.forEach((service) => {
                if (service.node !== node) return

                let isExisting = false
                services.forEach((svc) => {
                    if (service.equals(svc.name, svc.version)) {
                        isExisting = true
                    }
                })

                if (!isExisting) {
                    this.unregisterService(service.name, service.version, node.id)
                }
            })
        },
        unregisterService (name, version, nodeId) {
            return this.services.remove(nodeId || this.broker.nodeId, name, version)
        },
        unregisterServiceByNodeId (nodeId) {
            return this.services.removeAllByNodeId(nodeId)
        },
        hasService (serviceName, version, nodeId) {
            return this.services.has(serviceName, version, nodeId)
        },
        getNextAvailableActionEndpoint (actionName, opts = {}) {
            if (typeof actionName !== 'string') {
                return actionName
            } else {
                if (opts && opts.nodeId) { // remote
                    const endpoint = this.getActionEndpointByNodeId(actionName, opts.nodeId)
                    if (!endpoint) {
                        this.log.warn(`Service ${actionName} is not registered on node ${opts.nodeId}.`)
                        return new WeaveServiceNotFoundError(actionName)
                    }
                } else {
                    const endpointList = this.getActionEndpoints(actionName)
                    if (!endpointList) {
                        this.log.warn(`Service ${actionName} is not registered.`)
                        return new WeaveServiceNotFoundError(actionName)
                    }
                    const endpoint = endpointList.getNextAvailable()
                    if (!endpoint) {
                        this.log.warn(`Service ${actionName} is not available.`)
                        return new WeaveServiceNotFoundError(actionName)
                    }
                    return endpoint
                }
            }
        },
        getActionEndpoints (actionName) {
            return this.actions.get(actionName)
        },
        getLocalActionEndpoint (actionName) {
            const endpointList = this.getActionEndpoints(actionName)
            if (!endpointList) {
                this.log.warn(`Service ${actionName} is not registered localy.`)
                throw new WeaveServiceNotFoundError(actionName)
            }
            const endpoint = endpointList.getNextLocalEndpoint()
            if (!endpoint) {
                this.log.warn(`Service ${actionName} is not available localy.`)
                throw new WeaveServiceNotFoundError(actionName)
            }
            return endpoint
        },
        getLocalNodeInfo (forceGenerateInfo) {
            if (forceGenerateInfo || !this.nodes.localNode.info) {
                return this.generateLocalNodeInfo()
            }

            return this.nodes.localNode.info
        },
        generateLocalNodeInfo (incrementSequence) {
            const { client, IPList, sequence } = this.nodes.localNode
            const nodeInfo = { client, IPList, sequence }

            if (incrementSequence) {
                this.nodes.localNode.sequence++
            }

            if (this.broker.isStarted) {
                nodeInfo.services = this.services.list({
                    localOnly: true,
                    withActions: true,
                    withEvents: true,
                    withInternalActions: this.broker.options.internalActionsAccessable,
                    withSettings: true
                })
            } else {
                nodeInfo.services = []
            }

            this.nodes.localNode.info = nodeInfo
            return nodeInfo
        },
        processNodeInfo (payload) {
            const nodeId = payload.sender
            let node = this.nodes.get(nodeId)
            let isNew = false
            let isReconnected = false

            // There is no node with the specified ID. It must therefore be a new node.
            if (!node) {
                isNew = true
                node = new Node(nodeId)
                this.nodes.add(nodeId, node)
            } else if (!node.isAvailable) {
                // Node exists, but is marked as unavailable. It must therefore be a reconnected node.
                isReconnected = true
                node.isAvailable = true
                node.lastHeartbeatTime = Date.now()
            }

            // todo: Handle multiple nodes with the same ID.
            const updateNesesary = node.update(payload, isReconnected)

            if (updateNesesary && node.services) {
                this.registerServices(node, node.services)
            }

            if (isNew) {
                this.broker.bus.emit('node.connected', { node, isReconnected })
                this.log.info(`Node ${node.id} connected!`)
            } else if (isReconnected) {
                this.broker.bus.emit('node.connected', { node, isReconnected })
                this.log.info(`Node ${node.id} reconnected!`)
            } else {
                this.broker.bus.emit('node.updated', { node, isReconnected })
                this.log.info(`Node ${node.id} updated!`)
            }
        },
        nodeDisconnected (nodeId, isUnexpected) {
            const node = this.nodes.get(nodeId)
            if (node && node.isAvailable) {
                this.unregisterServiceByNodeId(node.id)
                node.disconnected(isUnexpected)
                this.broker.bus.emit('node.disconnected', nodeId, isUnexpected)
                this.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`)
            }
        },
        getNodeList (options) {
            return this.nodes.list(options)
        }
    }

    return registry
}

module.exports = createRegistry
