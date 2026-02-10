/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { omit } from "@weave-js/utils";
import { createEndpointList } from "./endpointCollection.mts";
import type {
  ActionCollection,
  Endpoint,
  Node,
  Registry,
  ServiceItem,
  ParsedAction,
} from "../../../types/index.js";

/**
 * Action list item interface
 */
interface ActionListItem {
  name: string;
  hasAvailable: boolean;
  hasLocal: boolean;
  count: number;
  action?: Omit<ParsedAction, "handler" | "service">;
  endpoints?: Array<{
    nodeId: string;
    state: boolean;
  }>;
}

/**
 * Action list options interface
 */
interface ActionListOptions {
  onlyLocals?: boolean;
  skipInternals?: boolean;
  withEndpoints?: boolean;
}

/**
 * Endpoint list interface
 */
interface EndpointList {
  name: string;
  endpoints: Endpoint[];
  add(node: Node, service: ServiceItem, action: ParsedAction): boolean;
  removeByNodeId(nodeId: string): void;
  removeByService(service: ServiceItem): void;
  getNextAvailableEndpoint(): Endpoint | null;
  hasAvailable(): boolean;
  hasLocal(): boolean;
  count(): number;
}

/**
 * Create an action collection.
 * @param registry Reference to the registry.
 * @returns Action collection
 */
export const createActionCollection = (registry: Registry): ActionCollection => {
  const actionCollection: ActionCollection = Object.create(null);
  const { runtime } = registry;
  const actions = new Map<string, EndpointList>();

  actionCollection.add = (node: Node, service: ServiceItem, action: ParsedAction): void => {
    let endPointList = actions.get(action.name);
    if (!endPointList) {
      endPointList = createEndpointList(runtime, action.name) as EndpointList;
      actions.set(action.name, endPointList);
    }
    endPointList.add(node, service, action);
  };

  actionCollection.get = (actionName: string): EndpointList | undefined => {
    return actions.get(actionName);
  };

  actionCollection.removeByService = (service: ServiceItem): void => {
    actions.forEach((list: EndpointList) => {
      list.removeByService(service);
    });
  };

  actionCollection.remove = (actionName: string, node: Node): void => {
    // todo: switch property order
    const endpoints = actions.get(actionName);
    if (endpoints) {
      endpoints.removeByNodeId(node.id);
    }
  };

  actionCollection.list = ({
    onlyLocals = false,
    skipInternals = false,
    withEndpoints = false,
  }: ActionListOptions = {}): ParsedAction[] => {
    const result: ActionListItem[] = [];

    actions.forEach((action: EndpointList) => {
      if (skipInternals && /^\$node/.test(action.name)) {
        return;
      }

      if (onlyLocals && !action.hasLocal()) {
        return;
      }

      // todo: don't create an new object
      const item: ActionListItem = {
        name: action.name,
        hasAvailable: action.hasAvailable(),
        hasLocal: action.hasLocal(),
        count: action.count(),
      };

      if (item.count > 0) {
        const endpoint = action.endpoints[0];
        if (endpoint) {
          item.action = omit(endpoint.action, ["handler", "service"]) as Omit<ParsedAction, "handler" | "service">;
        }
      }

      if (item.action == null || item.action.protected) {
        return;
      }

      if (withEndpoints) {
        item.endpoints = action.endpoints.map((endpoint: Endpoint) => {
          return {
            nodeId: endpoint.node.id,
            state: endpoint.state,
          };
        });
      }

      result.push(item);
    });
    return result as unknown as ParsedAction[];
  };

  return actionCollection;
};
