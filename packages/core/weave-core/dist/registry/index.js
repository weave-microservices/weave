"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRegistry = void 0;
const utils_1 = require("@weave-js/utils");
const node_collection_1 = require("./collections/node-collection");
const service_collection_1 = require("./collections/service-collection");
const action_collection_1 = require("./collections/action-collection");
const event_collection_1 = require("./collections/event-collection");
const action_endpoint_1 = require("./action-endpoint");
const node_1 = require("./node");
const errors_1 = require("../errors");
const noop = () => { };
function createRegistry() {
    let broker;
    let nodes;
    let services;
    let actions;
    let events;
    let serviceChanged;
    let middlewareHandler;
    let log;
    // registry object
    const registry = {
        broker,
        middlewareHandler,
        log,
        nodes,
        services,
        actions,
        events,
        init(b, m, s) {
            broker = b;
            middlewareHandler = m;
            serviceChanged = s;
            // init logger
            log = broker.createLogger('REGISTRY');
            // init collections
            nodes = node_collection_1.createNodeCollection(this);
            services = service_collection_1.createServiceCollection(this);
            actions = action_collection_1.createActionCollection(this);
            events = event_collection_1.createEventCollection(this);
            // register an event handler for "$broker.started".
            broker.bus.on('$broker.started', () => {
                if (this.nodes.localNode) {
                    this.generateLocalNodeInfo(true);
                }
            });
        },
        onRegisterLocalAction: noop,
        onRegisterRemoteAction: noop,
        /**
         * Check action visibility
         * @param {*} action Action definition
         * @param {*} node Node object
         * @returns {Boolean} Is visible
        */
        checkActionVisibility(action, node) {
            if (typeof action.visibility === 'undefined' || action.visibility === 'public') {
                return true;
            }
            if (action.visibility === 'protected' && node.isLocal) {
                return true;
            }
            return false;
        },
        /**
         *
         * Register a local service
         * @param {*} svc Service definition
         * @returns {void}
        */
        registerLocalService(serviceRegistrationObject) {
            if (!services.has(serviceRegistrationObject.name, serviceRegistrationObject.version, this.broker.nodeId)) {
                const service = services.add(this.nodes.localNode, serviceRegistrationObject.name, serviceRegistrationObject.version, serviceRegistrationObject.settings);
                if (serviceRegistrationObject.actions) {
                    this.registerActions(nodes.localNode, service, serviceRegistrationObject.actions);
                }
                if (serviceRegistrationObject.events) {
                    this.registerEvents(nodes.localNode, service, serviceRegistrationObject.events);
                }
                nodes.localNode.services.push(service);
                this.generateLocalNodeInfo(broker.isStarted);
                if (serviceRegistrationObject.version) {
                    this.log.info(`Service '${service.name}' (v${serviceRegistrationObject.version}) registered.`);
                }
                else {
                    this.log.info(`Service '${service.name}' registered.`);
                }
                this.serviceChanged(true);
            }
        },
        /**
         *
         * Register a remote service.
         * @param {*} node Node instance
         * @param {*} services Service definition
         * @returns {void}
        */
        registerRemoteServices(node, serviceSchemas) {
            serviceSchemas.forEach((serviceSchema) => {
                // todo: handle events
                let oldActions;
                let oldEvents;
                let svc = services.get(node.id, serviceSchema.name, serviceSchema.version);
                if (!svc) {
                    svc = services.add(node, serviceSchema.name, serviceSchema.version, serviceSchema.settings);
                }
                else {
                    // Update existing service with new actions
                    oldActions = Object.assign({}, svc.actions);
                    oldEvents = Object.assign({}, svc.events);
                    svc.update(serviceSchema);
                }
                if (serviceSchema.actions) {
                    this.registerActions(node, svc, serviceSchema.actions);
                }
                if (serviceSchema.events) {
                    this.registerEvents(node, svc, serviceSchema.events);
                }
                if (oldActions) {
                    // this.deregisterAction()
                    Object.keys(oldActions).forEach(actionName => {
                        if (!serviceSchema.actions[actionName]) {
                            this.actions.remove(actionName, node);
                        }
                    });
                }
                if (oldEvents) {
                    Object.keys(oldEvents).forEach(eventName => {
                        if (!serviceSchema.actions[eventName]) {
                            this.events.remove(eventName, node);
                        }
                    });
                }
            });
            // remove old services
            const oldServices = Array.from(services.services);
            oldServices.forEach((service) => {
                if (service.node.id !== node.id) {
                    return;
                }
                let isExisting = false;
                serviceSchemas.forEach((svc) => {
                    if (service.equals(svc.name, svc.version)) {
                        isExisting = true;
                    }
                });
                if (!isExisting) {
                    this.deregisterService(service.name, service.version, node.id);
                }
            });
            this.serviceChanged(false);
        },
        /**
         * Register events for a service
         * @param {*} node Node
         * @param {*} service Service object
         * @param {*} events Service events
         * @returns {void}
        */
        registerEvents(node, service, events) {
            Object.keys(events).forEach((key) => {
                const event = events[key];
                if (node.isLocal) {
                    event.handler = this.middlewareHandler.wrapHandler('localEvent', event.handler, event); // this.onRegisterLocalEvent(event)
                }
                this.events.add(node, service, event);
                service.addEvent(event);
            });
        },
        /**
         * Register actions for a service
         * @param {*} node Node
         * @param {*} service Service object
         * @param {*} actions Service actions
         * @returns {void}
        */
        registerActions(node, service, actions) {
            Object.keys(actions).forEach((key) => {
                const action = actions[key];
                if (!this.checkActionVisibility(action, node)) {
                    return;
                }
                if (node.isLocal) {
                    action.handler = this.middlewareHandler.wrapHandler('localAction', action.handler, action); // this.onRegisterLocalAction(action)
                }
                else {
                    action.handler = this.middlewareHandler.wrapHandler('remoteAction', this.broker.transport.request.bind(this.broker.transport), action); // this.onRegisterRemoteAction(action)
                }
                this.actions.add(node, service, action);
                service.addAction(action);
            });
        },
        getActionList(options) {
            return this.actions.list(options);
        },
        deregisterService(name, version, nodeId) {
            this.services.remove(nodeId || this.broker.nodeId, name, version);
            // It must be a local service
            if (!nodeId) {
                const serviceToRemove = this.nodes.localNode.services.find(service => service.name === name);
                this.nodes.localNode.services.splice(this.nodes.localNode.services.indexOf(serviceToRemove), 1);
            }
            if (!nodeId || nodeId === this.broker.nodeId) {
                this.generateLocalNodeInfo(true);
            }
        },
        deregisterServiceByNodeId(nodeId) {
            this.services.removeAllByNodeId(nodeId);
        },
        hasService(serviceName, version, nodeId) {
            return this.services.has(serviceName, version, nodeId);
        },
        getNextAvailableActionEndpoint(actionName, nodeId) {
            if (typeof actionName !== 'string') {
                return actionName;
            }
            else {
                // check if the action call is intended for a specific remote node
                if (nodeId) {
                    const endpoint = this.getActionEndpointByNodeId(actionName, nodeId);
                    // no endpoint for this action & node ID found
                    if (!endpoint) {
                        this.log.warn(`Service "${actionName}" is not registered on node ${nodeId}.`);
                        return new errors_1.WeaveServiceNotFoundError({ actionName, nodeId: nodeId });
                    }
                    return endpoint;
                }
                else {
                    const endpointList = this.getActionEndpoints(actionName);
                    if (!endpointList) {
                        this.log.warn(`Service "${actionName}" is not registered.`);
                        return new errors_1.WeaveServiceNotFoundError({ actionName });
                    }
                    const endpoint = endpointList.getNextAvailableEndpoint();
                    if (!endpoint) {
                        this.log.warn(`Service "${actionName}" is not available.`);
                        return new errors_1.WeaveServiceNotAvailableError({ actionName });
                    }
                    return endpoint;
                }
            }
        },
        getActionEndpointByNodeId(actionName, nodeId) {
            const endpointList = this.getActionEndpoints(actionName);
            if (endpointList) {
                return endpointList.getByNodeId(nodeId);
            }
            return null;
        },
        getActionEndpoints(actionName) {
            return this.actions.get(actionName);
        },
        createPrivateActionEndpoint(action) {
            return action_endpoint_1.createActionEndpoint(this.broker, this.nodes.localNode, action.service, action);
        },
        getLocalActionEndpoint(actionName) {
            const endpointList = this.getActionEndpoints(actionName);
            if (!endpointList) {
                this.log.warn(`Service "${actionName}" is not registered localy.`);
                this.broker.handleError(new errors_1.WeaveServiceNotFoundError({ actionName }));
            }
            const endpoint = endpointList.getNextLocalEndpoint();
            if (!endpoint) {
                this.log.warn(`Service "${actionName}" is not available localy.`);
                this.broker.handleError(new errors_1.WeaveServiceNotAvailableError({ actionName }));
            }
            return endpoint;
        },
        getNodeInfo(nodeId) {
            const node = this.nodes.get(nodeId);
            if (!node) {
                return null;
            }
            return node.info;
        },
        getLocalNodeInfo(forceGenerateInfo) {
            if (forceGenerateInfo || !this.nodes.localNode.info) {
                return this.generateLocalNodeInfo();
            }
            return this.nodes.localNode.info;
        },
        generateLocalNodeInfo(incrementSequence = false) {
            const { client, IPList, sequence } = this.nodes.localNode;
            const nodeInfo = { client, IPList, sequence };
            if (incrementSequence) {
                this.nodes.localNode.sequence++;
            }
            if (this.broker.isStarted) {
                nodeInfo.services = this.services.list({
                    localOnly: true,
                    withActions: true,
                    withEvents: true,
                    withNodeService: this.broker.options.publishNodeService,
                    withSettings: true
                });
            }
            else {
                nodeInfo.services = [];
            }
            this.nodes.localNode.info = utils_1.safeCopy(nodeInfo);
            return this.nodes.localNode.info;
        },
        processNodeInfo(payload) {
            const nodeId = payload.sender;
            let node = this.nodes.get(nodeId);
            let isNew = false;
            let isReconnected = false;
            // There is no node with the specified ID. It must therefore be a new node.
            if (!node) {
                isNew = true;
                node = node_1.createNode(nodeId);
                this.nodes.add(nodeId, node);
            }
            else if (!node.isAvailable) {
                // Node exists, but is marked as unavailable. It must therefore be a reconnected node.
                isReconnected = true;
                node.isAvailable = true;
                node.lastHeartbeatTime = Date.now();
            }
            // todo: Handle multiple nodes with the same ID.
            const updateNesesary = node.update(payload, isReconnected);
            if (updateNesesary && node.services) {
                this.registerRemoteServices(node, node.services);
            }
            if (isNew) {
                this.broker.broadcastLocal('$node.connected', { node, isReconnected });
                this.log.info(`Node "${node.id}" connected!`);
            }
            else if (isReconnected) {
                this.broker.broadcastLocal('$node.connected', { node, isReconnected });
                this.log.info(`Node "${node.id}" reconnected!`);
            }
            else {
                this.broker.broadcastLocal('$node.updated', { node, isReconnected });
                this.log.info(`Node "${node.id}" updated!`);
            }
        },
        nodeDisconnected(nodeId, isUnexpected = false) {
            const node = this.nodes.get(nodeId);
            if (node && node.isAvailable) {
                this.deregisterServiceByNodeId(node.id);
                node.disconnected(isUnexpected);
                this.broker.broadcastLocal('$node.disconnected', { nodeId, isUnexpected });
                this.log.warn(`Nodes "${node.id}"${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
            }
        },
        removeNode(nodeId) {
            this.nodes.remove(nodeId);
            this.broker.broadcastLocal('$node.removed', { nodeId });
            this.log.warn(`Node "${nodeId}" removed.`);
        },
        getNodeList(filterParams) {
            return this.nodes.list(filterParams);
        },
        getServiceList(filterParams) {
            return this.services.list(filterParams);
        }
    };
    return registry;
}
exports.createRegistry = createRegistry;
;
