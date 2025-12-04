/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { safeCopy } from "@weave-js/utils";
import type {
  Registry,
  Runtime,
  Node,
  ServiceItem,
  Endpoint,
  NodeCollection,
  ServiceCollection,
  ActionCollection,
  EventCollection,
  NodeInfo,
} from "../../types/index.js";

// own packages
import { createNodeCollection } from "./collections/nodeCollection.mts";
import { createServiceCollection } from "./collections/serviceCollection.mts";
import { createActionCollection } from "./collections/actionCollection.mts";
import { createEventCollection } from "./collections/eventCollection.mts";
import { createActionEndpoint } from "./actionEndpoint.mts";
import { createNode } from "./node.mts";
import { WeaveServiceNotFoundError, WeaveServiceNotAvailableError } from "../errors.mts";

const noop = () => {};

/**
 * Creates a service registry for managing distributed services and nodes
 *
 * The registry is responsible for:
 * - Tracking available nodes and their services
 * - Load balancing requests across service instances
 * - Service discovery and routing
 * - Handling node lifecycle events (connect/disconnect)
 * - Managing action and event endpoints
 *
 * @param runtime - Weave runtime instance
 * @returns Initialized registry instance with collections and routing logic
 * @example
 * const registry = createRegistry(runtime);
 * registry.registerLocalService(serviceItem);
 * const endpoint = registry.getNextAvailableActionEndpoint('math.add');
 */
export const createRegistry = (runtime: Runtime): Registry => {
  const { middlewareHandler } = runtime;

  const registry = {
    runtime,
    log: runtime.createLogger("REGISTRY"),
    nodeCollection: undefined as unknown as NodeCollection,
    serviceCollection: undefined as unknown as ServiceCollection,
    actionCollection: undefined as unknown as ActionCollection,
    eventCollection: undefined as unknown as EventCollection,
    /**
     * Initialize the registry
     * @param runtime - Runtime
     */
    init(runtime: Runtime): void {
      // init collections
      this.nodeCollection = createNodeCollection(this) as NodeCollection;
      this.serviceCollection = createServiceCollection(this) as ServiceCollection;
      this.actionCollection = createActionCollection(this) as ActionCollection;
      this.eventCollection = createEventCollection(this) as EventCollection;

      // register an event handler for "$broker.started".
      runtime.bus.on("$broker.started", () => {
        if (this.nodeCollection.localNode) {
          this.generateLocalNodeInfo(true);
        }
      });
    },
    // onRegisterLocalAction: noop,
    // onRegisterRemoteAction: noop,
    checkActionVisibility(action: { visibility?: string }, node: Node): boolean {
      if (
        typeof action.visibility === "undefined" ||
        action.visibility === "public" ||
        action.visibility === "published"
      ) {
        return true;
      }

      // Only callable from local services.
      if (action.visibility === "protected" && node.isLocal) {
        return true;
      }

      return false;
    },
    registerLocalService(serviceSpecification: ServiceItem): void {
      if (
        !this.serviceCollection.has(
          serviceSpecification.name,
          serviceSpecification.version,
          runtime.nodeId,
        )
      ) {
        const service = this.serviceCollection.add(
          this.nodeCollection.localNode,
          serviceSpecification.name,
          serviceSpecification.version,
          serviceSpecification.settings,
        );

        if (serviceSpecification.actions) {
          this.registerActions(
            this.nodeCollection.localNode,
            service,
            serviceSpecification.actions,
          );
        }

        if (serviceSpecification.events) {
          this.registerEvents(this.nodeCollection.localNode, service, serviceSpecification.events);
        }

        this.nodeCollection.localNode.services.push(service);

        this.generateLocalNodeInfo(runtime.state.isStarted);

        if (serviceSpecification.version) {
          this.log.info(`Service '${service.name}' (v${serviceSpecification.version}) registered.`);
        } else {
          this.log.info(`Service '${service.name}' registered.`);
        }

        runtime.services.serviceChanged(true);
      }
    },
    registerRemoteServices(node: Node, services: ServiceItem[]): void {
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
          Object.keys(oldActions).forEach((actionName) => {
            if (!service.actions[actionName]) {
              this.actionCollection.remove(actionName, node);
            }
          });
        }

        if (oldEvents) {
          Object.keys(oldEvents).forEach((eventName) => {
            if (!service.actions[eventName]) {
              this.eventCollection.remove(eventName, node);
            }
          });
        }
      });

      // remove old services
      const oldServices = Array.from(this.serviceCollection.services);
      oldServices.forEach((oldService) => {
        if (oldService.node && oldService.node.id !== node.id) {
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

      runtime.services.serviceChanged(false);
    },
    registerEvents(
      node: Node,
      service: ServiceItem,
      events: Record<string, { handler: Function }>,
    ): void {
      Object.keys(events).forEach((key) => {
        const event = events[key];

        if (node.isLocal) {
          event.handler = middlewareHandler!.wrapHandler("localEvent", event.handler, event); // this.onRegisterLocalEvent(event)
        }

        this.eventCollection.add(node, service, event);
        service.addEvent(event);
      });
    },
    registerActions(
      node: Node,
      service: ServiceItem,
      actions: Record<string, { handler: Function; visibility?: string }>,
    ): void {
      Object.keys(actions).forEach((key) => {
        const action = actions[key];

        if (!this.checkActionVisibility(action, node)) {
          return;
        }

        if (!node.isLocal) {
          action.handler = middlewareHandler!.wrapHandler(
            "remoteAction",
            runtime.transport!.sendRequest.bind(runtime.transport),
            action,
          );
        }

        this.actionCollection.add(node, service, action);

        service.addAction(action);
      });
    },
    deregisterService(name: string, version?: string | number, nodeId?: string): void {
      this.serviceCollection.remove(nodeId || runtime.nodeId, name, version);

      // It must be a local service if there is no node ID.
      if (!nodeId) {
        const serviceToRemove = this.nodeCollection.localNode.services.find(
          (service) => service.name === name,
        );
        this.nodeCollection.localNode.services.splice(
          this.nodeCollection.localNode.services.indexOf(serviceToRemove),
          1,
        );
      }

      if (!nodeId || nodeId === runtime.nodeId) {
        this.generateLocalNodeInfo(true);
      }
    },
    deregisterServiceByNodeId(nodeId: string): void {
      return this.serviceCollection.removeAllByNodeId(nodeId);
    },
    hasService(serviceName: string, version?: string | number, nodeId?: string): boolean {
      return this.serviceCollection.has(serviceName, version, nodeId);
    },
    getNextAvailableActionEndpoint(
      actionName: string | Endpoint,
      opts: any = {},
    ): Endpoint | Error {
      // Handle direct endpoint call.
      if (typeof actionName !== "string") {
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
    },
    getActionEndpointByNodeId(actionName: string, nodeId: string): Endpoint | null {
      const endpointList = this.getActionEndpoints(actionName);
      if (endpointList) {
        return endpointList.getByNodeId(nodeId);
      }
      return null;
    },
    getActionEndpoints(actionName: string): {
      getNextAvailableEndpoint: () => Endpoint | null;
      getByNodeId: (nodeId: string) => Endpoint | null;
      getNextLocalEndpoint: () => Endpoint | null;
    } | null {
      return this.actionCollection.get(actionName);
    },
    createPrivateActionEndpoint(action: { service: ServiceItem }): Endpoint {
      return createActionEndpoint(runtime, this.nodeCollection.localNode, action.service, action);
    },
    getLocalActionEndpoint(actionName: string): Endpoint | undefined {
      const endpointList = this.getActionEndpoints(actionName);

      if (!endpointList) {
        this.log.warn(`Service "${actionName}" is not registered localy.`);
        runtime.handleError(new WeaveServiceNotFoundError({ actionName }));
        return undefined;
      }

      const endpoint = endpointList.getNextLocalEndpoint();

      if (!endpoint) {
        this.log.warn(`Service "${actionName}" is not available localy.`);
        runtime.handleError(new WeaveServiceNotAvailableError({ actionName }));
        return undefined;
      }

      return endpoint;
    },
    getNodeInfo(nodeId: string): NodeInfo | null {
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

      if (runtime.state.isStarted) {
        nodeInfo.services = this.serviceCollection.list({
          localOnly: true,
          withActions: true,
          withEvents: true,
          withNodeService: runtime.options.registry?.publishNodeService,
          withSettings: true,
        });
      } else {
        nodeInfo.services = [];
      }
      this.nodeCollection.localNode.info = safeCopy(nodeInfo);
      return this.nodeCollection.localNode.info;
    },
    processNodeInfo(payload: { sender: string; [key: string]: unknown }): void {
      const nodeId: string = payload.sender;

      let node: Node | undefined = this.nodeCollection.get(nodeId);

      let isNew: boolean = false;

      let isReconnected: boolean = false;

      // There is no node with the specified ID. It must therefore be a new node.
      if (!node) {
        isNew = true;
        node = createNode(nodeId);
        this.nodeCollection.add(nodeId, node);
      } else if (!node.isAvailable) {
        // Node exists, but is marked as unavailable. It must therefore be a reconnected node.
        isReconnected = true;
        node.isAvailable = true;
        node.lastHeartbeatTime = Date.now();
      }

      // todo: Handle multiple nodes with the same ID.
      const updateNecessary = node.update(payload as unknown as NodeInfo, isReconnected);

      if (updateNecessary && node.services) {
        this.registerRemoteServices(node, node.services);
      }

      if (isNew) {
        runtime.eventBus!.broadcastLocal("$node.connected", { node, isReconnected });
        this.log.info(`Node "${node.id}" connected!`);
      } else if (isReconnected) {
        runtime.eventBus!.broadcastLocal("$node.connected", { node, isReconnected });
        this.log.info(`Node "${node.id}" reconnected!`);
      } else {
        runtime.eventBus!.broadcastLocal("$node.updated", { node, isReconnected });
        this.log.info(`Node "${node.id}" updated!`);
      }
    },
    nodeDisconnected(nodeId: string, isUnexpected?: boolean): void {
      const node = this.nodeCollection.get(nodeId);
      if (node && node.isAvailable) {
        this.deregisterServiceByNodeId(node.id);
        node.disconnected(isUnexpected);
        runtime.eventBus!.broadcastLocal("$node.disconnected", { nodeId, isUnexpected });
        this.log.warn(`Nodes "${node.id}"${isUnexpected ? " unexpectedly" : ""} disconnected.`);
      }
    },
    removeNode(nodeId: string): void {
      this.nodeCollection.remove(nodeId);
      runtime.eventBus!.broadcastLocal("$node.removed", { nodeId });
      this.log.warn(`Node "${nodeId}" removed.`);
    },
  };

  return registry;
};
