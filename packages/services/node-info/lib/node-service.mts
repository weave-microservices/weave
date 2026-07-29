/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { omit } from "@weave-js/utils";
import type { Context, Service, ServiceSchema } from "@weave-js/core/types/index.js";

/**
 * Parameters of the `$node.services` action.
 */
export interface NodeServicesParams {
  withActions?: boolean;
  withNodeService?: boolean;
}

/**
 * A service as it is listed by the registry.
 */
interface RegisteredService {
  name: string;
  version?: string | number;
  nodeId: string;
  actions?: Record<string, Record<string, unknown>>;
}

/**
 * The parts of the runtime registry this service reads from.
 *
 * The registry collections are typed without list parameters in the core types,
 * so they are narrowed here to what the actions actually use.
 */
interface NodeRegistry {
  serviceCollection: { list: (params: NodeServicesParams) => RegisteredService[] };
  actionCollection: { list: (params: unknown) => unknown[] };
  eventCollection: { list: (params: unknown) => unknown[] };
  nodeCollection: { list: (params: unknown) => unknown[] };
}

const getRegistry = (service: Service): NodeRegistry =>
  service.runtime.registry as unknown as NodeRegistry;

/**
 * An aggregated service - one entry per name and version, listing all nodes the
 * service is available on.
 */
export interface AggregatedService {
  name: string;
  version?: string | number;
  nodes: string[];
  actions?: Record<string, Record<string, unknown>>;
}

/** Action properties that must not be exposed. */
const HIDDEN_ACTION_PROPERTIES = ["handler", "service"];

export const name = "$node";

export const actions = {
  services: {
    params: {
      withActions: { type: "boolean", optional: true },
      withNodeService: { type: "boolean", optional: true },
    },
    handler(this: Service, context: Context<NodeServicesParams>): AggregatedService[] {
      const { withActions, withNodeService } = context.data;
      const services = getRegistry(this).serviceCollection.list({
        withActions,
        withNodeService,
      });

      const servicesFound: AggregatedService[] = [];

      services.forEach((service) => {
        let item = servicesFound.find(
          (result) => result.name === service.name && result.version === service.version,
        );

        if (item) {
          item.nodes.push(service.nodeId);
        } else {
          item = {
            name: service.name,
            version: service.version,
            nodes: [service.nodeId],
          };

          servicesFound.push(item);
        }

        if (!service.actions) {
          return;
        }

        // Actions of a service are identical on all nodes - the first node that
        // provides an action wins.
        item.actions = item.actions ?? {};

        Object.keys(service.actions).forEach((actionName) => {
          if (!item.actions![actionName]) {
            item.actions![actionName] = omit(
              service.actions![actionName],
              HIDDEN_ACTION_PROPERTIES,
            ) as Record<string, unknown>;
          }
        });
      });

      return servicesFound;
    },
  },
  actions: {
    handler(this: Service, context: Context) {
      return getRegistry(this).actionCollection.list(context.data);
    },
  },
  events: {
    handler(this: Service, context: Context) {
      return getRegistry(this).eventCollection.list(context.data);
    },
  },
  list: {
    handler(this: Service, context: Context) {
      return getRegistry(this).nodeCollection.list(context.data);
    },
  },
};

/**
 * Node info service - exposes the registry of the local runtime via `$node.*`.
 */
const nodeService: ServiceSchema = { name, actions };

export default nodeService;
