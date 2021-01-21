/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
import { Broker, ServiceChangedDelegate } from '../broker/broker'
import { safeCopy } from '@weave-js/utils';
// own packages
import { createNodeCollection, NodeCollection, NodeCollectionListFilterParams } from './collections/node-collection';
import { createServiceCollection, ServiceCollection, ServiceCollectionListFilterParams } from './collections/service-collection';
import { createActionCollection, ServiceActionCollection, ServiceActionListFilterParameters } from './collections/action-collection';
import { createEventCollection, EventCollection } from './collections/event-collection';
import { createActionEndpoint, Endpoint } from './action-endpoint';
import { createNode, Node, NodeInfo } from './node';
import { WeaveServiceNotFoundError, WeaveServiceNotAvailableError } from '../errors';
import { MiddlewareHandler } from '../broker/middleware';
import { Service, ServiceAction, ServiceSchema } from './service';
import { Logger } from '../logger';
const noop = () => { };

export interface Registry {
    broker: Broker
    log: Logger,
    nodes: NodeCollection,
    services: ServiceCollection,
    actions: ServiceActionCollection,
    events: EventCollection,
    init(broker: Broker, middlewareHandler: MiddlewareHandler, serviceChanged: ServiceChangedDelegate),
    onRegisterLocalAction(): void,
    onRegisterRemoteAction(): void,
    checkActionVisibility(action: any, node: any),
    middlewareHandler: MiddlewareHandler,
    deregisterService(serviceName: string, version?: number, nodeId?: string): void,
    registerLocalService(registryItem: any, notify?: boolean): void,
    registerRemoteServices(node: Node, services: Array<ServiceSchema>): void,
    registerActions(node: Node, service: Service, actions: any): void,
    registerEvents(node: Node, service: Service, events: any): void,
    getNextAvailableActionEndpoint(actionName: string, nodeId?: string): Endpoint,
    getActionList(options: ServiceActionListFilterParameters): Array<any>,
    deregisterServiceByNodeId(nodeId: string): void,
    hasService(serviceName: string, version?: number, nodeId?: string): boolean,
    getActionEndpointByNodeId(actionName: string, nodeId: string): Endpoint,
    getActionEndpoints(actionName: string): Endpoint,
    createPrivateActionEndpoint(action: ServiceAction): Endpoint,
    getLocalActionEndpoint(actionName: string): Endpoint,
    getNodeInfo(nodeId: string): NodeInfo,
    getLocalNodeInfo(forceGenerateInfo?: boolean): NodeInfo,
    generateLocalNodeInfo(incrementSequence: boolean): NodeInfo,
    processNodeInfo(payload: any),
    nodeDisconnected(nodeId: string, isUnexpected?: boolean): void,
    removeNode(nodeId: string): void,
    getNodeList(filterParams: NodeCollectionListFilterParams): Array<any>,
    getServiceList(filterParams: ServiceCollectionListFilterParams): Array<any>
}

export function createRegistry(): Registry {
    let broker: Broker
    let nodes: NodeCollection
    let services: ServiceCollection
    let actions: ServiceActionCollection
    let events: EventCollection
    let serviceChanged: ServiceChangedDelegate
    let middlewareHandler: MiddlewareHandler
    let log: Logger

    // registry object
    const registry: Registry = {
        broker,
        middlewareHandler,
        log,
        nodes,
        services,
        actions,
        events,
        init(b: Broker, m: MiddlewareHandler, s: ServiceChangedDelegate) {
            broker = b;
            middlewareHandler = m;
            serviceChanged = s

            // init logger
            log = broker.createLogger('REGISTRY');

            // init collections
            nodes = createNodeCollection(this);
            services = createServiceCollection(this);
            actions = createActionCollection(this);
            events = createEventCollection(this);

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
        registerLocalService(svc) { // todo was kommt hier an?
            if (!this.services.has(svc.name, svc.version, this.broker.nodeId)) {
                const service = this.services.add(this.nodes.localNode, svc.name, svc.version, svc.settings);

                if (svc.actions) {
                    this.registerActions(this.nodes.localNode, service, svc.actions);
                }

                if (svc.events) {
                    this.registerEvents(this.nodes.localNode, service, svc.events);
                }

                this.nodes.localNode.services.push(service);
                this.generateLocalNodeInfo(this.broker.isStarted);

                if (svc.version) {
                    this.log.info(`Service '${service.name}' (v${svc.version}) registered.`);
                } else {
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
        registerRemoteServices(node: Node, services: Array<ServiceSchema>) {
            services.forEach((service) => {
                // todo: handle events
                let oldActions;
                let oldEvents;
                let svc = this.services.get(node.id, service.name, service.version);

                if (!svc) {
                    svc = this.services.add(node, service.name, service.version, service.settings);
                } else {
                    // Update existing service with new actions
                    oldActions = Object.assign({}, svc.actions);
                    oldEvents = Object.assign({}, svc.events);
                    svc.update(service);
                }

                if (service.actions) {
                    this.registerActions(node, svc, service.actions);
                }

                if (service.events) {
                    this.registerEvents(node, svc, service.events);
                }

                if (oldActions) {
                    // this.deregisterAction()
                    Object.keys(oldActions).forEach(actionName => {
                        if (!service.actions[actionName]) {
                            this.actions.remove(actionName, node);
                        }
                    });
                }

                if (oldEvents) {
                    Object.keys(oldEvents).forEach(eventName => {
                        if (!service.actions[eventName]) {
                            this.events.remove(eventName, node);
                        }
                    });
                }
            });

            // remove old services
            const oldServices = Array.from(this.services.services);

            oldServices.forEach((service) => {
                if (service.node.id !== node.id) {
                    return;
                }
                let isExisting = false;
                
                services.forEach((svc) => {
                    if ((service as any).equals(svc.name, svc.version)) {
                        isExisting = true;
                    }
                });

                if (!isExisting) {
                    this.deregisterService((service as any).name, (service as any).version, node.id);
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
        registerEvents(node: Node, service: Service, events: any) {
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
        registerActions(node: Node, service: Service, actions: any) {
            Object.keys(actions).forEach((key) => {
                const action = actions[key];
                if (!this.checkActionVisibility(action, node)) {
                    return;
                }

                if (node.isLocal) {
                    action.handler = this.middlewareHandler.wrapHandler('localAction', action.handler, action); // this.onRegisterLocalAction(action)
                } else {
                    action.handler = this.middlewareHandler.wrapHandler('remoteAction', this.broker.transport.request.bind(this.broker.transport), action); // this.onRegisterRemoteAction(action)
                }

                this.actions.add(node, service, action);
                service.addAction(action);
            });
        },
        getActionList(options) {
            return this.actions.list(options);
        },
        deregisterService(name: string, version?: number, nodeId?: string) {
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
        deregisterServiceByNodeId(nodeId: string) {
            this.services.removeAllByNodeId(nodeId);
        },
        hasService(serviceName: string, version: number, nodeId: string): boolean {
            return this.services.has(serviceName, version, nodeId);
        },
        getNextAvailableActionEndpoint(actionName: string, nodeId?: string): Endpoint {
            if (typeof actionName !== 'string') {
                return actionName;
            } else {
                // check if the action call is intended for a specific remote node
                if (nodeId) {
                    const endpoint = this.getActionEndpointByNodeId(actionName, nodeId);
                    // no endpoint for this action & node ID found
                    if (!endpoint) {
                        this.log.warn(`Service "${actionName}" is not registered on node ${nodeId}.`);
                        return new WeaveServiceNotFoundError({ actionName, nodeId: nodeId });
                    }
                    return endpoint;
                }
                else {
                    const endpointList = this.getActionEndpoints(actionName);
                    if (!endpointList) {
                        this.log.warn(`Service "${actionName}" is not registered.`);
                        return new WeaveServiceNotFoundError({ actionName });
                    }
                    const endpoint = endpointList.getNextAvailableEndpoint();
                    if (!endpoint) {
                        this.log.warn(`Service "${actionName}" is not available.`);
                        return new WeaveServiceNotAvailableError({ actionName });
                    }
                    return endpoint;
                }
            }
        },
        getActionEndpointByNodeId(actionName: string, nodeId: string): Endpoint {
            const endpointList = this.getActionEndpoints(actionName);
            
            if (endpointList) {
                return endpointList.getByNodeId(nodeId);
            }

            return null;
        },
        getActionEndpoints(actionName: string): Endpoint {
            return this.actions.get(actionName);
        },
        createPrivateActionEndpoint(action: ServiceAction): Endpoint {
            return createActionEndpoint(this.broker, this.nodes.localNode, action.service, action);
        },
        getLocalActionEndpoint(actionName: string): Endpoint {
            const endpointList = this.getActionEndpoints(actionName);
            if (!endpointList) {
                this.log.warn(`Service "${actionName}" is not registered localy.`);
                this.broker.handleError(new WeaveServiceNotFoundError({ actionName }));
            }
            const endpoint = endpointList.getNextLocalEndpoint();
            if (!endpoint) {
                this.log.warn(`Service "${actionName}" is not available localy.`);
                this.broker.handleError(new WeaveServiceNotAvailableError({ actionName }));
            }
            return endpoint;
        },
        getNodeInfo(nodeId: string): NodeInfo {
            const node = this.nodes.get(nodeId);
            
            if (!node) {
                return null;
            }

            return node.info;
        },
        getLocalNodeInfo(forceGenerateInfo?: boolean): NodeInfo {
            if (forceGenerateInfo || !this.nodes.localNode.info) {
                return this.generateLocalNodeInfo();
            }
            return this.nodes.localNode.info;
        },
        generateLocalNodeInfo(incrementSequence: boolean = false): NodeInfo {
            const { client, IPList, sequence } = this.nodes.localNode;
            const nodeInfo = { client, IPList, sequence };
            if (incrementSequence) {
                this.nodes.localNode.sequence++;
            }
            if (this.broker.isStarted) {
                (nodeInfo as any).services = this.services.list({
                    localOnly: true,
                    withActions: true,
                    withEvents: true,
                    withNodeService: this.broker.options.publishNodeService,
                    withSettings: true
                });
            }
            else {
                (nodeInfo as any).services = [];
            }
            this.nodes.localNode.info = safeCopy(nodeInfo);
            return this.nodes.localNode.info;
        },
        processNodeInfo(payload: any) {
            const nodeId = payload.sender;
            let node = this.nodes.get(nodeId);
            let isNew = false;
            let isReconnected = false;
            // There is no node with the specified ID. It must therefore be a new node.
            if (!node) {
                isNew = true;
                node = createNode(nodeId);
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
        nodeDisconnected(nodeId: string, isUnexpected: boolean = false) {
            const node = this.nodes.get(nodeId);
            if (node && node.isAvailable) {
                this.deregisterServiceByNodeId(node.id);
                node.disconnected(isUnexpected);
                this.broker.broadcastLocal('$node.disconnected', { nodeId, isUnexpected });
                this.log.warn(`Nodes "${node.id}"${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
            }
        },
        removeNode(nodeId: string) {
            this.nodes.remove(nodeId);
            this.broker.broadcastLocal('$node.removed', { nodeId });
            this.log.warn(`Node "${nodeId}" removed.`);
        },
        getNodeList(filterParams: NodeCollectionListFilterParams) {
            return this.nodes.list(filterParams);
        },
        getServiceList(filterParams: ServiceCollectionListFilterParams) {
            return this.services.list(filterParams);
        }
    };
    return registry;
};
