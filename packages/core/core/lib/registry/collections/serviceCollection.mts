/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { omit, remove } from "@weave-js/utils";
import { createServiceItem } from "../serviceItem.mts";
import type {
  Node,
  Registry,
  ServiceCollection,
  ServiceItem,
  ServiceSettings,
  ParsedAction,
  ParsedEvent,
} from "../../../types/index.js";

/**
 * Service list options interface
 */
interface ServiceListOptions {
  localOnly?: boolean;
  withActions?: boolean;
  withEvents?: boolean;
  withNodeService?: boolean;
  withSettings?: boolean;
  withPrivate?: boolean;
}

/**
 * Service list item interface
 */
interface ServiceListItem {
  name: string;
  nodeId: string;
  version?: string | number;
  isAvailable: boolean;
  isPrivate: boolean | undefined;
  settings?: ServiceSettings;
  actions?: Record<string, Omit<ParsedAction, "handler" | "service">>;
  events?: Record<string, Omit<ParsedEvent, "service" | "handler">>;
}

/**
 * Action list item interface
 */
interface ActionListItem {
  name: string;
  count: number;
  hasLocal: boolean;
}

/**
 * Endpoint list interface
 */
interface EndpointList {
  count(): number;
  hasLocal(): boolean;
  endpointByNodeId(nodeId: string): any;
}

/**
 * Service collection factory
 * @param registry Registry instance
 * @returns Service collection
 */
export const createServiceCollection = (registry: Registry): ServiceCollection => {
  const serviceCollection: ServiceCollection = Object.create(null);
  const { runtime } = registry;
  const services: ServiceItem[] = (serviceCollection.services = [] as unknown as Set<ServiceItem>) as unknown as ServiceItem[];
  const actions = new Map<string, EndpointList>();

  serviceCollection.add = (
    node: Node,
    name: string,
    version?: string | number,
    settings?: ServiceSettings,
  ): ServiceItem => {
    const item = createServiceItem(node, name, version, settings, node.id === runtime.nodeId);
    services.push(item);
    return item;
  };

  serviceCollection.get = (
    nodeId: string,
    name: string,
    version?: string | number,
  ): ServiceItem | undefined =>
    services.find((svc: ServiceItem) => svc.equals(name, version, nodeId));

  serviceCollection.has = (
    name: string,
    version?: string | number,
    nodeId?: string,
  ): boolean => {
    return !!services.find((svc: ServiceItem) => svc.equals(name, version, nodeId));
  };

  serviceCollection.remove = (
    nodeId: string,
    name: string,
    version?: string | number,
  ): void => {
    const service = serviceCollection.get(nodeId, name, version);

    if (service) {
      registry.actionCollection.removeByService(service);
      registry.eventCollection.removeByService(service);
      remove(services, (svc: ServiceItem) => svc === service);
    }
  };

  serviceCollection.removeAllByNodeId = (nodeId: string): void => {
    remove(services, (service: ServiceItem) => {
      if (service.node?.id === nodeId) {
        registry.actionCollection.removeByService(service);
        registry.eventCollection.removeByService(service);
        return true;
      }
      return false;
    });
  };

  (serviceCollection as any).tryFindActionsByActionName = (actionName: string): EndpointList | undefined =>
    actions.get(actionName);

  (serviceCollection as any).getActionsList = (): ActionListItem[] => {
    const result: ActionListItem[] = [];
    actions.forEach((action: EndpointList, key: string) => {
      const item: ActionListItem = {
        name: key,
        count: action.count(),
        hasLocal: action.hasLocal(),
      };
      result.push(item);
    });
    return result;
  };

  serviceCollection.list = ({
    localOnly = false,
    withActions = false,
    withEvents = false,
    withNodeService = false,
    withSettings = false,
    withPrivate = false,
  }: ServiceListOptions = {}): ServiceItem[] => {
    const result: ServiceListItem[] = [];
    services.forEach((service: ServiceItem) => {
      if (/^\$node/.test(service.name) && !withNodeService) {
        return;
      }

      const isPrivate = service.settings && (service.settings as any).$private;

      if (isPrivate && withPrivate === false) {
        return;
      }

      if (localOnly && !service.isLocal) {
        return;
      }

      const item: ServiceListItem = {
        name: service.name,
        nodeId: service.node?.id ?? "",
        version: service.version,
        isAvailable: service.node?.isAvailable ?? false,
        isPrivate,
      };

      if (withSettings) {
        item.settings = service.settings;
      }

      if (withActions && service.actions) {
        item.actions = {};
        Object.values(service.actions).forEach((action: ParsedAction) => {
          if (action) {
            item.actions![action.name] = omit(action, ["handler", "service"]) as Omit<ParsedAction, "handler" | "service">;
          }
        });
      }

      if (withEvents && service.events) {
        item.events = {};
        Object.values(service.events).forEach((event: ParsedEvent) => {
          if (event) {
            item.events![event.name] = omit(event, ["service", "handler"]) as Omit<ParsedEvent, "service" | "handler">;
          }
        });
      }

      result.push(item);
    });
    return result as unknown as ServiceItem[];
  };

  (serviceCollection as any).findEndpointByNodeId = (actionName: string, nodeId: string): any => {
    const endpointListItem = (serviceCollection as any).tryFindActionsByActionName(actionName);
    if (endpointListItem) {
      return endpointListItem.endpointByNodeId(nodeId);
    }
  };

  return serviceCollection;
};
