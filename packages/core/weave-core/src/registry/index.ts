/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
import { safeCopy } from '@weave-js/utils';
import { createNodeCollection } from './collections/node-collection';
import { createServiceCollection } from './collections/service-collection';
import { createActionCollection } from './collections/action-collection';
import { createEventCollection } from './collections/event-collection';
import { createActionEndpoint } from './action-endpoint';
import { createNode } from './node';
import { WeaveServiceNotFoundError, WeaveServiceNotAvailableError, WeaveError } from '../errors';
import { Registry } from '../shared/interfaces/registry.interface';
import { Logger } from '../shared/interfaces/logger.interface';
import { MiddlewareHandler } from '../shared/interfaces/middleware-handler.interface';
import { Broker } from '../shared/interfaces/broker.interface';
import { ServiceChangedDelegate } from '../shared/types/service-changed-delegate.type';
import { NodeCollection } from '../shared/interfaces/node-collection.interface';
import { ServiceCollection } from '../shared/interfaces/service-collection.interface';
import { ServiceActionCollection } from '../shared/interfaces/service-action-collection.interface';
import { EventCollection } from '../shared/interfaces/event-collection.inteface';
import { ServiceRegistrationObject } from '../shared/types/service-registration-object.type';
import { Node } from '../shared/interfaces/node.interface';
import { ServiceSchema } from '../shared/interfaces/service-schema.interface';
import { ServiceCollectionListFilterParams } from '../shared/types/service-collection-list-filter-params.type';
import { NodeCollectionListFilterParams } from '../shared/types/node-collection-list-filter-params.type';
import { ServiceAction } from '../shared/interfaces/service-action.interface';
import { Endpoint } from '../shared/interfaces/endpoint.interface';
import { EndpointCollection } from '../shared/interfaces/endpoint-collection.interface';
import { ServiceItem } from '../shared/interfaces/service-item.interface';
import { NodeInfo } from '../shared/types/node-info.type';

const noop = () => { };

export function createRegistry(): Registry {
    // registry object
    const registry: Registry = {

        init(b: Broker, m: MiddlewareHandler, s: ServiceChangedDelegate) {
            this.broker = b;
            this.middlewareHandler = m;
            this.serviceChanged = s

            // init logger
            this.log = this.broker.createLogger('REGISTRY');

            // init collections
            this.nodeCollection = createNodeCollection(this);
            this.serviceCollection = createServiceCollection(this);
            this.actionCollection = createActionCollection(this);
            this.eventCollection = createEventCollection(this);

            // register an event handler for "$broker.started".
            this.broker.bus.on('$broker.started', () => {
                if (this.nodeCollection.localNode) {
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
        registerLocalService(serviceRegistrationObject: ServiceRegistrationObject) { // todo was kommt hier an?
            if (!this.serviceCollection.has(serviceRegistrationObject.name, serviceRegistrationObject.version, this.broker.nodeId)) {
                const service = this.serviceCollection.add(this.nodeCollection.localNode, serviceRegistrationObject.name, serviceRegistrationObject.version, serviceRegistrationObject.settings);

                if (serviceRegistrationObject.actions) {
                    this.registerActions(this.nodeCollection.localNode, service, serviceRegistrationObject.actions);
                }

                if (serviceRegistrationObject.events) {
                    this.registerEvents(this.nodeCollection.localNode, service, serviceRegistrationObject.events);
                }

                this.nodeCollection.localNode.services.push(service);
                this.generateLocalNodeInfo(this.broker.isStarted);

                if (serviceRegistrationObject.version) {
                    this.log.info(`Service '${service.name}' (v${serviceRegistrationObject.version}) registered.`);
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
        registerRemoteServices(node: Node, serviceSchemas: Array<ServiceSchema>) {
            serviceSchemas.forEach((serviceSchema) => {
                // todo: handle events
                let oldActions;
                let oldEvents;
                let svc = (this.serviceCollection as ServiceCollection).get(node.id, serviceSchema.name, serviceSchema.version);

                if (!svc) {
                    svc = (this.serviceCollection as ServiceCollection).add(node, serviceSchema.name, serviceSchema.version, serviceSchema.settings);
                } else {
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
                            this.actionCollection.remove(actionName, node);
                        }
                    });
                }

                if (oldEvents) {
                    Object.keys(oldEvents).forEach(eventName => {
                        if (!serviceSchema.actions[eventName]) {
                            this.eventCollection.remove(eventName, node);
                        }
                    });
                }
            });

            // remove old services
            const oldServices = Array.from((this.ServiceCollection as ServiceCollection).services);

            oldServices.forEach((service) => {
                if (service.node.id !== node.id) {
                    return;
                }
                let isExisting = false;
                
                serviceSchemas.forEach((svc) => {
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
        registerEvents(node: Node, service: ServiceItem, events: any) {
            Object.keys(events).forEach((key) => {
                const event = events[key];
                if (node.isLocal) {
                    event.handler = this.middlewareHandler.wrapHandler('localEvent', event.handler, event); // this.onRegisterLocalEvent(event)
                }
                this.eventCollection.add(node, service, event);
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
        registerActions (node: Node, service: ServiceItem, actions: any) {
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

                this.actionCollection.add(node, service, action);
                service.addAction(action);
            });
        },
        getActionList(options) {
            return this.actionCollection.list(options);
        },
        deregisterService(name: string, version?: number, nodeId?: string) {
            this.serviceCollection.remove(nodeId || this.broker.nodeId, name, version);
            // It must be a local service
            if (!nodeId) {
                const serviceToRemove = this.nodeCollection.localNode.services.find(service => service.name === name);
                this.nodeCollection.localNode.services.splice(this.nodeCollection.localNode.services.indexOf(serviceToRemove), 1);
            }
            if (!nodeId || nodeId === this.broker.nodeId) {
                this.generateLocalNodeInfo(true);
            }
        },
        deregisterServiceByNodeId(nodeId: string) {
            this.serviceCollection.removeAllByNodeId(nodeId);
        },
        hasService(serviceName: string, version: number, nodeId: string): boolean {
            return this.serviceCollection.has(serviceName, version, nodeId);
        },
        getNextAvailableActionEndpoint(actionName: string, nodeId?: string): Endpoint | WeaveError {
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
        getActionEndpoints(actionName: string): EndpointCollection {
            return this.actionCollection.get(actionName);
        },
        createPrivateActionEndpoint(action: ServiceAction): Endpoint {
            return createActionEndpoint(this.broker, this.nodeCollection.localNode, action.service, action);
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
            const node = this.nodeCollection.get(nodeId);
            
            if (!node) {
                return null;
            }

            return node.info;
        },
        getLocalNodeInfo(forceGenerateInfo?: boolean): NodeInfo {
            if (forceGenerateInfo || !this.nodeCollection.localNode.info) {
                return this.generateLocalNodeInfo();
            }
            return this.nodeCollection.localNode.info;
        },
        generateLocalNodeInfo(incrementSequence: boolean = false): NodeInfo {
            const { client, IPList, sequence } = this.nodeCollection.localNode;
            const nodeInfo = { client, IPList, sequence };

            if (incrementSequence) {
                this.nodeCollection.localNode.sequence++;
            }

            if (this.broker.isStarted) {
                (nodeInfo as any).services = this.serviceCollection.list({
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
            this.nodeCollection.localNode.info = safeCopy(nodeInfo);
            return this.nodeCollection.localNode.info;
        },
        processNodeInfo(payload: any) {
            const nodeId = payload.sender;
            let node = this.nodeCollection.get(nodeId);
            let isNew = false;
            let isReconnected = false;
            // There is no node with the specified ID. It must therefore be a new node.
            if (!node) {
                isNew = true;
                node = createNode(nodeId);
                this.nodeCollection.add(nodeId, node);
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
            const node = this.nodeCollection.get(nodeId);
            if (node && node.isAvailable) {
                this.deregisterServiceByNodeId(node.id);
                node.disconnected(isUnexpected);
                this.broker.broadcastLocal('$node.disconnected', { nodeId, isUnexpected });
                this.log.warn(`Nodes "${node.id}"${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
            }
        },
        removeNode(nodeId: string) {
            this.nodeCollection.remove(nodeId);
            this.broker.broadcastLocal('$node.removed', { nodeId });
            this.log.warn(`Node "${nodeId}" removed.`);
        },
        getNodeList(filterParams: NodeCollectionListFilterParams) {
            return this.nodeCollection.list(filterParams);
        },
        getServiceList(filterParams: ServiceCollectionListFilterParams) {
            return this.serviceCollection.list(filterParams);
        }
    };
    return registry;
};
