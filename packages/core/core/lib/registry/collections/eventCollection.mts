/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { omit, match } from "@weave-js/utils";
import { createEndpointList } from "./endpointCollection.mts";
import type {
  Context,
  Endpoint,
  EventCollection,
  Node,
  Registry,
  Runtime,
  ServiceItem,
  WeaveEvent,
} from "../../../types/index.js";

/**
 * Event list item interface
 */
interface EventListItem {
  name: string;
  hasAvailable: boolean;
  groupName: string | undefined;
  hasLocal: boolean;
  count: number;
  event?: Omit<WeaveEvent, "handler" | "service">;
  endpoints?: Array<{
    nodeId: string;
    state: boolean;
  }>;
}

/**
 * Event list options interface
 */
interface EventListOptions {
  onlyLocals?: boolean;
  skipInternals?: boolean;
  withEndpoints?: boolean;
}

/**
 * Endpoint list interface
 */
interface EndpointList {
  name: string;
  groupName: string | undefined;
  endpoints: Endpoint[];
  add(node: Node, service: ServiceItem, event: WeaveEvent): Endpoint;
  removeByNodeId(nodeId: string): void;
  removeByService(service: ServiceItem): void;
  getNextAvailableEndpoint(): Endpoint | null;
  getNextLocalEndpoint(): Endpoint | null;
  hasAvailable(): boolean;
  hasLocal(): boolean;
  count(): number;
}

const broadcastEvents = ["broadcast", "localBroadcast"];

/**
 * Create event collection
 * @param registry Registry reference
 * @return Event collection
 */
export const createEventCollection = (registry: Registry): EventCollection => {
  const eventCollection: EventCollection = Object.create(null);
  const { runtime } = registry;
  const events: EndpointList[] = []; // todo: refactor to js Map

  const getAllEventsByEventName = (eventName: string): EndpointList[] =>
    events.filter((list: EndpointList) => match(eventName, list.name));

  /**
   * Add node to collection
   * @param node Node
   * @param service Service
   * @param event Event
   * @return Endpoint
   */
  eventCollection.add = (node: Node, service: ServiceItem, event: WeaveEvent): void => {
    const groupName = event.group || service.name;
    let endpointList = (eventCollection as any).get(event.name, groupName);
    if (!endpointList) {
      endpointList = createEndpointList(runtime, event.name, groupName);
      events.push(endpointList);
    }
    endpointList.add(node, service, event);
  };

  (eventCollection as any).get = (eventName: string, groupName: string): EndpointList | undefined => {
    return events.find(
      (endpointList: EndpointList) =>
        endpointList.name === eventName && endpointList.groupName === groupName,
    );
  };

  (eventCollection as any).remove = (node: Node, eventName: string): void => {
    events.map((list: EndpointList) => {
      if (list.name === eventName) {
        list.removeByNodeId(node.id);
      }
    });
  };

  (eventCollection as any).removeByService = (service: ServiceItem): void => {
    events.map((list: EndpointList) => {
      list.removeByService(service);
    });
  };

  eventCollection.getBalancedEndpoints = (
    eventName: string,
    groups?: string[],
  ): [Endpoint | null, string][] => {
    const result: [Endpoint | null, string][] = [];
    getAllEventsByEventName(eventName).forEach((endpointList: EndpointList) => {
      if (groups == null || groups.length === 0 || groups.indexOf(endpointList.groupName!) !== -1) {
        const endpoint = endpointList.getNextAvailableEndpoint();
        if (endpoint && endpoint.isAvailable()) {
          result.push([endpoint, endpointList.groupName!]);
        }
      }
    });
    return result;
  };

  (eventCollection as any).getAllEndpoints = (eventName: string): Endpoint[] => {
    return getAllEventsByEventName(eventName)
      .map((list: EndpointList) => list.endpoints)
      .map((endpoints: Endpoint[]) => endpoints.filter((endpoint: Endpoint) => endpoint.isAvailable()))
      .reduce((prev: Endpoint[], curr: Endpoint[]) => prev.concat(curr), []);
  };

  eventCollection.getAllEndpointsUniqueNodes = (eventName: string, groups?: string[]): Endpoint[] => {
    let endpoints: Endpoint[] | Endpoint[][] = getAllEventsByEventName(eventName)
      .filter(
        (endpointList: EndpointList) =>
          groups == null || groups.length === 0 || groups.includes(endpointList.groupName!),
      )
      .map((endpointList: EndpointList) => endpointList.endpoints);

    if (endpoints.length > 0) {
      endpoints = (endpoints as Endpoint[][]).reduce(
        (prev: Endpoint[], curr: Endpoint[]) => prev.concat(curr),
        [],
      );
    }

    const unique: Record<string, string> = {};
    const distinct: Endpoint[] = [];

    for (const i in endpoints) {
      if (typeof unique[(endpoints as Endpoint[])[i].node.id] === "undefined") {
        distinct.push((endpoints as Endpoint[])[i]);
      }
      unique[(endpoints as Endpoint[])[i].node.id] = (endpoints as Endpoint[])[i].node.id;
    }

    return distinct;
  };

  eventCollection.emitLocal = (context: Context): Promise<void> => {
    const promises: Promise<any>[] = [];
    const groups = context.eventGroups;
    const isBroadcast = broadcastEvents.includes(context.eventType!);

    getAllEventsByEventName(context.eventName!)
      .filter(
        (endpointList: EndpointList) =>
          groups == null || groups.length === 0 || groups.includes(endpointList.groupName!),
      )
      .map((list: EndpointList) => {
        if (isBroadcast) {
          list.endpoints.map((endpoint: Endpoint) => {
            if (endpoint.isLocal && endpoint.action.handler) {
              promises.push(
                endpoint.action.handler(context, {
                  service: endpoint.action.service,
                  runtime,
                  errors: {},
                }),
              );
            }
          });
        } else {
          const endpoint = list.getNextLocalEndpoint();
          if (endpoint && endpoint.isLocal && endpoint.action.handler) {
            promises.push(
              endpoint.action.handler(context, {
                service: endpoint.action.service,
                runtime,
                errors: {},
              }),
            );
          }
        }
      });

    return Promise.all(promises).then(() => undefined);
  };

  eventCollection.list = ({
    onlyLocals = false,
    skipInternals = false,
    withEndpoints = false,
  }: EventListOptions = {}): WeaveEvent[] => {
    const result: EventListItem[] = [];

    events.forEach((list: EndpointList) => {
      if (skipInternals && /^\$node/.test(list.name)) {
        return;
      }

      if (onlyLocals && !list.hasLocal()) {
        return;
      }

      const item: EventListItem = {
        name: list.name,
        hasAvailable: list.hasAvailable(),
        groupName: list.groupName,
        hasLocal: list.hasLocal(),
        count: list.count(),
      };

      if (item.count > 0) {
        const endpoint = list.endpoints[0];
        if (endpoint && endpoint.action) {
          item.event = omit(endpoint.action, ["handler", "service"]) as Omit<WeaveEvent, "handler" | "service">;
        }
      }

      if (withEndpoints) {
        item.endpoints = list.endpoints.map((endpoint: Endpoint) => {
          return {
            nodeId: endpoint.node.id,
            state: endpoint.state,
          };
        });
      }
      result.push(item);
    });
    return result as unknown as WeaveEvent[];
  };

  return eventCollection;
};
