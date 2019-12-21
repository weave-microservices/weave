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
const { WeaveServiceNotFoundError } = require('../errors')
const Node = require('./node')
const { removeCircularReferences } = require('../utils.js')

const createRegistry = () => {
    const noop = () => {}

    // registry object
    const registry = {
        init (broker, middlewareHandler, serviceChanged) {
            this.broker = broker
            // this.transport = transport
            this.middlewareHandler = middlewareHandler
            this.serviceChanged = serviceChanged
            // create logger
            this.log = broker.createLogger('REGISTRY')

            // create collections
            this.nodes = MakeNodeCollection(this)
            this.services = MakeServiceCollection(this)
            this.actions = MakeActionCollection(this)
            this.events = MakeEventCollection(this)

            this.broker.bus.on('$broker.started', () => {
                if (this.nodes.localNode) {
                    this.generateLocalNodeInfo(true)
                }
            })
        },
        onRegisterLocalAction: noop,
        onRegisterRemoteAction: noop,
        /**
         * Check action visibility
         * @param {*} action Action definition
         * @param {*} node Node object
         * @returns {Boolean} Is visible
         */
        checkActionVisibility (action, node) {
            if (typeof action.visibility === 'undefined' || action.visibility === 'public') {
                return true
            }
            if (action.visibility === 'protected' && node.isLocal) {
                return true
            }
            return false
        },
        /**
         *
         * Register a local service
         * @param {*} svc Service definition
         * @returns {void}
         */
        registerLocalService (svc) {
            if (!this.services.has(svc.name, svc.version, this.broker.nodeId)) {
                const service = this.services.add(this.nodes.localNode, svc.name, svc.version, svc.settings)

                if (svc.actions) {
                    this.registerActions(this.nodes.localNode, service, svc.actions)
                }
                if (svc.events) {
                    this.registerEvents(this.nodes.localNode, service, svc.events)
                }

                this.nodes.localNode.services.push(service)

                this.generateLocalNodeInfo(this.broker.isStarted)

                if (svc.version) {
                    this.log.info(`Service '${service.name}' (v${svc.version}) registered.`)
                } else {
                    this.log.info(`Service '${service.name}' registered.`)
                }

                this.serviceChanged(true)
            }
        },
        /**
         *
         * Register a remote service
         * @param {*} node Node
         * @param {*} services Service definition
         * @returns {void}
         */
        registerRemoteServices (node, services) {
            services.forEach((service) => {
                // todo: handle events
                let oldActions
                let svc = this.services.get(node.id, service.name, service.version)

                if (!svc) {
                    svc = this.services.add(node, service.name, service.version, service.settings)
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
                    // this.deregisterAction()
                    Object.keys(oldActions).forEach(key => {
                        // const action = oldActions[key]
                        if (!service.actions[key]) {
                            /*
                            function deregisterAction (nodeId, action) {
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
                    this.deregisterService(service.name, service.version, node.id)
                }
            })

            this.serviceChanged(false)
        },
        /**
         * Register events for a service
         * @param {*} node Node
         * @param {*} service Service object
         * @param {*} events Service events
         * @returns {void}
         */
        registerEvents (node, service, events) {
            Object.keys(events).forEach((key) => {
                const event = events[key]
                this.events.add(node, service, event)

                if (node.isLocal) {
                    event.handler = this.onRegisterLocalEvent(event)
                }

                service.addEvent(event)
            })
        },
        /**
         * Register actions for a service
         * @param {*} node Node
         * @param {*} service Service object
         * @param {*} actions Service actions
         * @returns {void}
         */
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
        deregisterService (name, version, nodeId) {
            this.services.remove(nodeId || this.broker.nodeId, name, version)

            // It must be a local service
            if (!nodeId) {
                const serviceToRemove = this.nodes.localNode.services.find(service => service.name === name)
                this.nodes.localNode.services.splice(this.nodes.localNode.services.indexOf(serviceToRemove), 1)
            }

            if (!nodeId || nodeId === this.broker.nodeId) {
                this.generateLocalNodeInfo(true)
            }
        },
        deregisterServiceByNodeId (nodeId) {
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
                    return endpoint
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
        getActionEndpointByNodeId (actionName, nodeId) {
            const endpointList = this.getActionEndpoints(actionName)
            if (endpointList) {
                return endpointList.getByNodeId(nodeId)
            }
            return null
        },
        getActionEndpoints (actionName) {
            return this.actions.get(actionName)
        },
        createPrivateEndpoint (action) {
            return Endpoint(this.broker, this.nodes.localNode, action.service, action)
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
                    withNodeService: this.broker.options.publishNodeService,
                    withSettings: true
                })
            } else {
                nodeInfo.services = []
            }

            this.nodes.localNode.info = removeCircularReferences(nodeInfo)
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
                node = Node(nodeId)
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
                this.registerRemoteServices(node, node.services)
            }

            if (isNew) {
                this.broker.broadcastLocal('$node.connected', { node, isReconnected })
                this.log.debug(`Node ${node.id} connected!`)
            } else if (isReconnected) {
                this.broker.broadcastLocal('$node.connected', { node, isReconnected })
                this.log.debug(`Node ${node.id} reconnected!`)
            } else {
                this.broker.broadcastLocal('$node.updated', { node, isReconnected })
                this.log.debug(`Node ${node.id} updated!`)
            }
        },
        nodeDisconnected (nodeId, isUnexpected) {
            const node = this.nodes.get(nodeId)
            if (node && node.isAvailable) {
                this.deregisterServiceByNodeId(node.id)
                node.disconnected(isUnexpected)
                this.broker.broadcastLocal('$node.disconnected', { nodeId, isUnexpected })
                this.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`)
            }
        },
        removeNode (nodeId) {
            this.nodes.remove(nodeId)
            this.broker.broadcastLocal('$node.removed', { nodeId })
            this.log.warn(`Node '${nodeId}' removed.`)
        },
        getNodeList (options) {
            return this.nodes.list(options)
        },
        getServiceList (options) {
            return this.services.list(options)
        }
    }

    return registry
}

module.exports = createRegistry
