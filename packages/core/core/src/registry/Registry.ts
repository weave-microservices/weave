// @ts-check
/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

import { Logger } from "../logger/Logger";
import { Runtime } from "../runtime/Runtime";
import { ServiceSchema } from "../service/ServiceSchema";
import { ActionEndpoint } from "./actionEndpoint";
import { ActionCollection } from "./collections/actionCollection";
import { EventCollection } from "./collections/eventCollection";
import { NodeCollection } from "./collections/nodeCollection";
import { ServiceCollection } from "./collections/serviceCollection";
import { Node } from './Node';

const { safeCopy } = require('@weave-js/utils');

// own packages
const { createNodeCollection } = require('./collections/nodeCollection');
const { createServiceCollection } = require('./collections/serviceCollection');
const { createActionCollection } = require('./collections/actionCollection');
const { createEventCollection } = require('./collections/eventCollection');
const { createActionEndpoint } = require('./actionEndpoint');
const { WeaveServiceNotFoundError, WeaveServiceNotAvailableError } = require('../errors');

class Registry {
  #runtime: Runtime;
  public log: Logger
  public nodeCollection: NodeCollection
  public serviceCollection: ServiceCollection
  public actionCollection: ActionCollection
  public eventCollection: EventCollection

  constructor (runtime: Runtime) {
    this.#runtime = runtime;

    this.log = runtime.createLogger('REGISTRY')

    this.nodeCollection = createNodeCollection({ runtime, registry: this });
    this.serviceCollection = createServiceCollection({ runtime, registry: this });
    this.actionCollection = createActionCollection({ runtime, registry: this });
    this.eventCollection = createEventCollection({ runtime, registry: this });

    this.#runtime.bus.on('$broker.started', () => {
      if (this.nodeCollection.localNode) {
        this.generateLocalNodeInfo(true);
      }
    });
  }

  public registerRemoteServices (node: Node, services: Array<ServiceSchema>) {
    services.forEach((service) => {
      // todo: handle events
      let oldActions;
      let oldEvents;
      let svc = this.serviceCollection.get(node.id, service.name, service.version);

      if (!svc) {
        svc = this.serviceCollection.add(node, service.name, service.version, service.settings);
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
        Object.keys(oldActions).forEach(actionName => {
          if (!service.actions[actionName]) {
            this.actionCollection.remove(actionName, node);
          }
        });
      }

      if (oldEvents) {
        Object.keys(oldEvents).forEach(eventName => {
          if (!service.actions[eventName]) {
            this.eventCollection.remove(eventName, node);
          }
        });
      }
    });

    // remove old services
    const oldServices = Array.from(this.serviceCollection.services);
    oldServices.forEach((oldService) => {
      if (oldService.node.id !== node.id) {
        return;
      }

      let isExisting = false;

      // check if the old service exists in the new services.
      services.forEach((svc) => {
        if (oldService.equals(svc.name, svc.version)) {
          isExisting = true;
        }
      });

      if (!isExisting) {
        this.deregisterService(oldService.name, oldService.version, node.id);
      }
    });

    this.#runtime.services.serviceChanged(false);
  }

  public registerLocalService (serviceSpecification: ServiceSchema) {
    if (!this.serviceCollection.has(serviceSpecification.name, serviceSpecification.version, this.#runtime.nodeId)) {
      const service = this.serviceCollection.add(
        this.nodeCollection.localNode,
        serviceSpecification.name,
        serviceSpecification.version,
        serviceSpecification.settings
      );

      if (serviceSpecification.actions) {
        this.registerActions(this.nodeCollection.localNode, service, serviceSpecification.actions);
      }

      if (serviceSpecification.events) {
        this.registerEvents(this.nodeCollection.localNode, service, serviceSpecification.events);
      }

      this.nodeCollection.localNode.services.push(service);

      this.generateLocalNodeInfo(this.#runtime.state.isStarted);

      if (serviceSpecification.version) {
        this.log.info(`Service '${service.name}' (v${serviceSpecification.version}) registered.`);
      } else {
        this.log.info(`Service '${service.name}' registered.`);
      }

      this.#runtime.services.serviceChanged(true);
    }
  }

  public checkActionVisibility (action: any, node: Node) {
    if (
      typeof action.visibility === 'undefined' ||
      action.visibility === 'public' ||
      action.visibility === 'published'
    ) {
      return true;
    }

    // Only callable from local services.
    if (action.visibility === 'protected' && node.isLocal) {
      return true;
    }

    return false;
  }

  public generateLocalNodeInfo (incrementSequence: boolean = false) {
    const { client, IPList, sequence } = this.nodeCollection.localNode;
    const nodeInfo = {
      client,
      IPList,
      sequence,
      services: []
    };

    if (incrementSequence) {
      this.nodeCollection.localNode.sequence++;
    }

    if (this.#runtime.state.isStarted) {
      nodeInfo.services = this.serviceCollection.list({
        localOnly: true,
        withActions: true,
        withEvents: true,
        withNodeService: this.#runtime.options.registry.publishNodeService,
        withSettings: true
      });
    } else {
      nodeInfo.services = [];
    }

    this.nodeCollection.localNode.info = safeCopy(nodeInfo);
    return this.nodeCollection.localNode.info;
  }

  public registerEvents (node: Node, service: ServiceRegistryItem, events: any) {
    Object.keys(events).forEach((key) => {
      const event = events[key];

      if (node.isLocal) {
        event.handler = middlewareHandler.wrapHandler('localEvent', event.handler, event); // this.onRegisterLocalEvent(event)
      }

      this.eventCollection.add(node, service, event);
      service.addEvent(event);
    });
  }

  public registerActions (node: Node, service, actions) {
    Object.keys(actions).forEach((key) => {
      const action = actions[key];

      if (!this.checkActionVisibility(action, node)) {
        return;
      }

      if (node.isLocal) {
        action.handler = middlewareHandler.wrapHandler('localAction', action.handler, action);
      } else {
        action.handler = middlewareHandler.wrapHandler('remoteAction', runtime.transport.sendRequest.bind(runtime.transport), action);
      }

      this.actionCollection.add(node, service, action);

      service.addAction(action);
    });
  }

  public deregisterService (name, version, nodeId) {
    this.serviceCollection.remove(nodeId || runtime.nodeId, name, version);

    // It must be a local service if there is no node ID.
    if (!nodeId) {
      const serviceToRemove = this.nodeCollection.localNode.services.find(service => service.name === name);
      this.nodeCollection.localNode.services.splice(this.nodeCollection.localNode.services.indexOf(serviceToRemove), 1);
    }

    if (!nodeId || nodeId === runtime.nodeId) {
      this.generateLocalNodeInfo(true);
    }
  }

  public deregisterServiceByNodeId (nodeId) {
    return this.serviceCollection.removeAllByNodeId(nodeId);
  }

  public hasService (serviceName, version, nodeId) {
    return this.serviceCollection.has(serviceName, version, nodeId);
  }
  public getNextAvailableActionEndpoint (actionName, opts = {}) {
    // Handle direct endpoint call.
    if (typeof actionName !== 'string') {
      return actionName;
    } else {
      // check if the action call is intended for a specific remote node
      if (opts.nodeId) {
        const endpoint = this.getActionEndpointByNodeId(actionName, opts.nodeId);

        // no endpoint for this action & node ID found
        if (!endpoint) {
          this.log.warn(`Service "${actionName}" is not registered on node ${opts.nodeId}.`);
          return new WeaveServiceNotFoundError({ actionName, nodeId: opts.nodeId });
        }

        return endpoint;
      } else {
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
  }

  public getActionEndpointByNodeId (actionName: string, nodeId: string) {
    const endpointList = this.getActionEndpoints(actionName);
    if (endpointList) {
      return endpointList.getByNodeId(nodeId);
    }
    return null;
  }

  public getActionEndpoints (actionName: string) {
    return this.actionCollection.get(actionName);
  }

  public createPrivateActionEndpoint (action) {
    return new ActionEndpoint(runtime, this.nodeCollection.localNode, action.service, action);
  }

  public getLocalActionEndpoint (actionName) {
    const endpointList = this.getActionEndpoints(actionName);

    if (!endpointList) {
      this.log.warn(`Service "${actionName}" is not registered localy.`);
      runtime.handleError(new WeaveServiceNotFoundError({ actionName }));
    }

    const endpoint = endpointList.getNextLocalEndpoint();

    if (!endpoint) {
      this.log.warn(`Service "${actionName}" is not available localy.`);
      runtime.handleError(new WeaveServiceNotAvailableError({ actionName }));
    }

    return endpoint;
  }

  public getNodeInfo (nodeId) {
    const node = this.nodeCollection.get(nodeId);

    if (!node) {
      return null;
    }

    return node.info;
  }

  public getLocalNodeInfo (forceGenerateInfo) {
    if (forceGenerateInfo || !this.nodeCollection.localNode.info) {
      return this.generateLocalNodeInfo();
    }

    return this.nodeCollection.localNode.info;
  }

  public processNodeInfo (payload) {
    /**
     * @type {string}
    */
    const nodeId = payload.sender;

    /**
     * @type {Node}
    */
    let node = this.nodeCollection.get(nodeId);

    /**
     * @type {boolean}
    */
    let isNew = false;

    /**
     * @type {boolean}
    */
    let isReconnected = false;

    // There is no node with the specified ID. It must therefore be a new node.
    if (!node) {
      isNew = true;
      node = new Node(nodeId);
      this.nodeCollection.add(nodeId, node);
    } else if (!node.isAvailable) {
      // Node exists, but is marked as unavailable. It must therefore be a reconnected node.
      isReconnected = true;
      node.isAvailable = true;
      node.lastHeartbeatTime = Date.now();
    }

    // todo: Handle multiple nodes with the same ID.
    const updateNecessary = node.update(payload, isReconnected);

    if (updateNecessary && node.services) {
      this.registerRemoteServices(node, node.services);
    }

    if (isNew) {
      runtime.eventBus.broadcastLocal('$node.connected', { node, isReconnected });
      this.log.info(`Node "${node.id}" connected!`);
    } else if (isReconnected) {
      runtime.eventBus.broadcastLocal('$node.connected', { node, isReconnected });
      this.log.info(`Node "${node.id}" reconnected!`);
    } else {
      runtime.eventBus.broadcastLocal('$node.updated', { node, isReconnected });
      this.log.info(`Node "${node.id}" updated!`);
    }
  }

  public nodeDisconnected (nodeId, isUnexpected) {
    const node = this.nodeCollection.get(nodeId);
    if (node && node.isAvailable) {
      this.deregisterServiceByNodeId(node.id);
      node.disconnected(isUnexpected);
      runtime.eventBus.broadcastLocal('$node.disconnected', { nodeId, isUnexpected });
      this.log.warn(`Nodes "${node.id}"${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
    }
  }

  public removeNode (nodeId: string) {
    this.nodeCollection.remove(nodeId);
    runtime.eventBus.broadcastLocal('$node.removed', { nodeId });
    this.log.warn(`Node "${nodeId}" removed.`);
  }
}

export { Registry };

// exports.createRegistry = (runtime: Runtime) => {
//   const { middlewareHandler } = runtime;

//   const registry: Registry = {
//     runtime,
//     log: runtime.createLogger('REGISTRY'),
//     /**
//    * Initialize the registry
//    * @param {Runtime} runtime Runtime
//    * @returns {void}
//    */
//     init (runtime: Runtime) {
//       // init collections
//       this.nodeCollection = createNodeCollection(this);
//       this.serviceCollection = createServiceCollection(this);
//       this.actionCollection = createActionCollection(this);
//       this.eventCollection = createEventCollection(this);

//       // register an event handler for "$broker.started".
//       runtime.bus.on('$broker.started', () => {
//         if (this.nodeCollection.localNode) {
//           this.generateLocalNodeInfo(true);
//         }
//       });
//     },
//     onRegisterLocalAction: noop,
//     onRegisterRemoteAction: noop,
//     checkActionVisibility (action, node: Node) {
//       if (
//         typeof action.visibility === 'undefined' ||
//         action.visibility === 'public' ||
//         action.visibility === 'published'
//       ) {
//         return true;
//       }

//       // Only callable from local services.
//       if (action.visibility === 'protected' && node.isLocal) {
//         return true;
//       }

//       return false;
//     },
//     registerLocalService (serviceSpecification) {
//       if (!this.serviceCollection.has(serviceSpecification.name, serviceSpecification.version, runtime.nodeId)) {
//         const service = this.serviceCollection.add(this.nodeCollection.localNode, serviceSpecification.name, serviceSpecification.version, serviceSpecification.settings);

//         if (serviceSpecification.actions) {
//           this.registerActions(this.nodeCollection.localNode, service, serviceSpecification.actions);
//         }

//         if (serviceSpecification.events) {
//           this.registerEvents(this.nodeCollection.localNode, service, serviceSpecification.events);
//         }

//         this.nodeCollection.localNode.services.push(service);

//         this.generateLocalNodeInfo(runtime.state.isStarted);

//         if (serviceSpecification.version) {
//           this.log.info(`Service '${service.name}' (v${serviceSpecification.version}) registered.`);
//         } else {
//           this.log.info(`Service '${service.name}' registered.`);
//         }

//         runtime.services.serviceChanged(true);
//       }
//     },
//     registerRemoteServices (node, services) {
//       services.forEach((service) => {
//         // todo: handle events
//         let oldActions;
//         let oldEvents;
//         let svc = this.serviceCollection.get(node.id, service.name, service.version);

//         if (!svc) {
//           svc = this.serviceCollection.add(node, service.name, service.version, service.settings);
//         } else {
//           // Update existing service with new actions
//           oldActions = Object.assign({}, svc.actions);
//           oldEvents = Object.assign({}, svc.events);
//           svc.update(service);
//         }

//         if (service.actions) {
//           this.registerActions(node, svc, service.actions);
//         }

//         if (service.events) {
//           this.registerEvents(node, svc, service.events);
//         }

//         if (oldActions) {
//           Object.keys(oldActions).forEach(actionName => {
//             if (!service.actions[actionName]) {
//               this.actionCollection.remove(actionName, node);
//             }
//           });
//         }

//         if (oldEvents) {
//           Object.keys(oldEvents).forEach(eventName => {
//             if (!service.actions[eventName]) {
//               this.eventCollection.remove(eventName, node);
//             }
//           });
//         }
//       });

//       // remove old services
//       const oldServices = Array.from(this.serviceCollection.services);
//       oldServices.forEach((oldService) => {
//         if (oldService.node.id !== node.id) {
//           return;
//         }

//         let isExisting = false;

//         // check if the old service exists in the new services.
//         services.forEach((svc) => {
//           if (oldService.equals(svc.name, svc.version)) {
//             isExisting = true;
//           }
//         });

//         if (!isExisting) {
//           this.deregisterService(oldService.name, oldService.version, node.id);
//         }
//       });

//       runtime.services.serviceChanged(false);
//     },
//     registerEvents (node, service, events) {
//       Object.keys(events).forEach((key) => {
//         const event = events[key];

//         if (node.isLocal) {
//           event.handler = middlewareHandler.wrapHandler('localEvent', event.handler, event); // this.onRegisterLocalEvent(event)
//         }

//         this.eventCollection.add(node, service, event);
//         service.addEvent(event);
//       });
//     },
//     registerActions (node, service, actions) {
//       Object.keys(actions).forEach((key) => {
//         const action = actions[key];

//         if (!this.checkActionVisibility(action, node)) {
//           return;
//         }

//         if (node.isLocal) {
//           action.handler = middlewareHandler.wrapHandler('localAction', action.handler, action);
//         } else {
//           action.handler = middlewareHandler.wrapHandler('remoteAction', runtime.transport.sendRequest.bind(runtime.transport), action);
//         }

//         this.actionCollection.add(node, service, action);

//         service.addAction(action);
//       });
//     },
//     deregisterService (name, version, nodeId) {
//       this.serviceCollection.remove(nodeId || runtime.nodeId, name, version);

//       // It must be a local service if there is no node ID.
//       if (!nodeId) {
//         const serviceToRemove = this.nodeCollection.localNode.services.find(service => service.name === name);
//         this.nodeCollection.localNode.services.splice(this.nodeCollection.localNode.services.indexOf(serviceToRemove), 1);
//       }

//       if (!nodeId || nodeId === runtime.nodeId) {
//         this.generateLocalNodeInfo(true);
//       }
//     },
//     deregisterServiceByNodeId (nodeId) {
//       return this.serviceCollection.removeAllByNodeId(nodeId);
//     },
//     hasService (serviceName, version, nodeId) {
//       return this.serviceCollection.has(serviceName, version, nodeId);
//     },
//     getNextAvailableActionEndpoint (actionName, opts = {}) {
//       // Handle direct endpoint call.
//       if (typeof actionName !== 'string') {
//         return actionName;
//       } else {
//         // check if the action call is intended for a specific remote node
//         if (opts.nodeId) {
//           const endpoint = this.getActionEndpointByNodeId(actionName, opts.nodeId);

//           // no endpoint for this action & node ID found
//           if (!endpoint) {
//             this.log.warn(`Service "${actionName}" is not registered on node ${opts.nodeId}.`);
//             return new WeaveServiceNotFoundError({ actionName, nodeId: opts.nodeId });
//           }

//           return endpoint;
//         } else {
//           const endpointList = this.getActionEndpoints(actionName);

//           if (!endpointList) {
//             this.log.warn(`Service "${actionName}" is not registered.`);
//             return new WeaveServiceNotFoundError({ actionName });
//           }

//           const endpoint = endpointList.getNextAvailableEndpoint();

//           if (!endpoint) {
//             this.log.warn(`Service "${actionName}" is not available.`);
//             return new WeaveServiceNotAvailableError({ actionName });
//           }

//           return endpoint;
//         }
//       }
//     },
//     getActionEndpointByNodeId (actionName, nodeId) {
//       const endpointList = this.getActionEndpoints(actionName);
//       if (endpointList) {
//         return endpointList.getByNodeId(nodeId);
//       }
//       return null;
//     },
//     getActionEndpoints (actionName) {
//       return this.actionCollection.get(actionName);
//     },
//     createPrivateActionEndpoint (action) {
//       return new ActionEndpoint(runtime, this.nodeCollection.localNode, action.service, action);
//     },
//     getLocalActionEndpoint (actionName) {
//       const endpointList = this.getActionEndpoints(actionName);

//       if (!endpointList) {
//         this.log.warn(`Service "${actionName}" is not registered localy.`);
//         runtime.handleError(new WeaveServiceNotFoundError({ actionName }));
//       }

//       const endpoint = endpointList.getNextLocalEndpoint();

//       if (!endpoint) {
//         this.log.warn(`Service "${actionName}" is not available localy.`);
//         runtime.handleError(new WeaveServiceNotAvailableError({ actionName }));
//       }

//       return endpoint;
//     },
//     getNodeInfo (nodeId) {
//       const node = this.nodeCollection.get(nodeId);

//       if (!node) {
//         return null;
//       }

//       return node.info;
//     },
//     getLocalNodeInfo (forceGenerateInfo) {
//       if (forceGenerateInfo || !this.nodeCollection.localNode.info) {
//         return this.generateLocalNodeInfo();
//       }

//       return this.nodeCollection.localNode.info;
//     },
//     generateLocalNodeInfo (incrementSequence = false) {
//       const { client, IPList, sequence } = this.nodeCollection.localNode;
//       const nodeInfo = { client, IPList, sequence };

//       if (incrementSequence) {
//         this.nodeCollection.localNode.sequence++;
//       }

//       if (runtime.state.isStarted) {
//         nodeInfo.services = this.serviceCollection.list({
//           localOnly: true,
//           withActions: true,
//           withEvents: true,
//           withNodeService: runtime.options.registry.publishNodeService,
//           withSettings: true
//         });
//       } else {
//         nodeInfo.services = [];
//       }

//       this.nodeCollection.localNode.info = safeCopy(nodeInfo);
//       return this.nodeCollection.localNode.info;
//     },
//     processNodeInfo (payload) {
//       /**
//        * @type {string}
//       */
//       const nodeId = payload.sender;

//       /**
//        * @type {Node}
//       */
//       let node = this.nodeCollection.get(nodeId);

//       /**
//        * @type {boolean}
//       */
//       let isNew = false;

//       /**
//        * @type {boolean}
//       */
//       let isReconnected = false;

//       // There is no node with the specified ID. It must therefore be a new node.
//       if (!node) {
//         isNew = true;
//         node = new Node(nodeId);
//         this.nodeCollection.add(nodeId, node);
//       } else if (!node.isAvailable) {
//         // Node exists, but is marked as unavailable. It must therefore be a reconnected node.
//         isReconnected = true;
//         node.isAvailable = true;
//         node.lastHeartbeatTime = Date.now();
//       }

//       // todo: Handle multiple nodes with the same ID.
//       const updateNecessary = node.update(payload, isReconnected);

//       if (updateNecessary && node.services) {
//         this.registerRemoteServices(node, node.services);
//       }

//       if (isNew) {
//         runtime.eventBus.broadcastLocal('$node.connected', { node, isReconnected });
//         this.log.info(`Node "${node.id}" connected!`);
//       } else if (isReconnected) {
//         runtime.eventBus.broadcastLocal('$node.connected', { node, isReconnected });
//         this.log.info(`Node "${node.id}" reconnected!`);
//       } else {
//         runtime.eventBus.broadcastLocal('$node.updated', { node, isReconnected });
//         this.log.info(`Node "${node.id}" updated!`);
//       }
//     },
//     nodeDisconnected (nodeId, isUnexpected) {
//       const node = this.nodeCollection.get(nodeId);
//       if (node && node.isAvailable) {
//         this.deregisterServiceByNodeId(node.id);
//         node.disconnected(isUnexpected);
//         runtime.eventBus.broadcastLocal('$node.disconnected', { nodeId, isUnexpected });
//         this.log.warn(`Nodes "${node.id}"${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
//       }
//     },
//     removeNode (nodeId) {
//       this.nodeCollection.remove(nodeId);
//       runtime.eventBus.broadcastLocal('$node.removed', { nodeId });
//       this.log.warn(`Node "${nodeId}" removed.`);
//     }
//   };

//   return registry;
// };
