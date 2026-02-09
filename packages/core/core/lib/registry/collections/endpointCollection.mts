/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { createActionEndpoint } from "../actionEndpoint.mts";
import { loadBalancingStrategy } from "../../constants.mts";
import type {
  Endpoint,
  Node,
  Runtime,
  ServiceItem,
  WeaveAction,
} from "../../../types/index.js";

/**
 * Endpoint collection interface
 */
interface EndpointCollection {
  name: string;
  groupName: string | undefined;
  isInternal: boolean;
  localEndpoints: Endpoint[];
  endpoints: Endpoint[];
  add(node: Node, service: ServiceItem, action: WeaveAction): boolean;
  hasAvailable(): boolean;
  hasLocal(): boolean;
  getNextAvailableEndpoint(): Endpoint | null;
  getNextLocalEndpoint(): Endpoint | null;
  count(): number;
  getByNodeId(nodeId: string): Endpoint | undefined;
  removeByNodeId(nodeId: string): void;
  removeByService(service: ServiceItem): void;
}

/**
 * Create endpoint list
 * @param runtime Runtime instance
 * @param name name
 * @param groupName Group name
 * @returns EndpointCollection
 */
export const createEndpointList = (
  runtime: Runtime,
  name: string,
  groupName?: string,
): EndpointCollection => {
  const endpointList: EndpointCollection = Object.create(null);
  const options = runtime.options;
  const list: Endpoint[] = (endpointList.endpoints = []);

  let counter = 0;

  endpointList.name = name;
  endpointList.groupName = groupName;
  endpointList.isInternal = name.startsWith("$");
  endpointList.localEndpoints = [];

  const setLocalEndpoints = (): void => {
    endpointList.localEndpoints = list.filter((endpoint: Endpoint) => endpoint.isLocal);
  };

  /**
   * Select an Entpoint with the selected Load-Balancing-Strategy
   * @param endpointList List of all available Endpoints
   * @returns Endpoint
   */
  const select = (endpointList: Endpoint[]): Endpoint => {
    // Round robin
    if (options.registry?.loadBalancingStrategy === loadBalancingStrategy.ROUND_ROBIN) {
      if (counter >= endpointList.length) {
        counter = 0;
      }
      const res = endpointList[counter++];
      return res;
    } else {
      const randomInt = (min: number, max: number): number =>
        Math.floor(Math.random() * (max - min + 1) + min);
      return endpointList[randomInt(0, endpointList.length - 1)];
      // todo: implement random load balancer
    }
  };

  endpointList.add = (node: Node, service: ServiceItem, action: WeaveAction): boolean => {
    // todo: addaction
    const foundEndpoint = list.find(
      (endpoint: Endpoint) => endpoint.node.id === node.id && endpoint.service.name === service.name,
    );

    if (foundEndpoint) {
      foundEndpoint.updateAction(action);
      return false;
    }

    const newEndpoint = createActionEndpoint(runtime, node, service, action);

    list.push(newEndpoint);
    setLocalEndpoints();
    return true;
  };

  endpointList.hasAvailable = (): boolean =>
    list.find((endpoint: Endpoint) => endpoint.isAvailable()) != null;

  endpointList.hasLocal = (): boolean => endpointList.localEndpoints.length > 0;

  endpointList.getNextAvailableEndpoint = (): Endpoint | null => {
    if (list.length === 0) {
      return null;
    }

    // If there is a local service, get a local endpoint
    if (endpointList.isInternal && endpointList.hasLocal()) {
      return endpointList.getNextLocalEndpoint();
    }

    // If only one endpoint is available return this.
    if (list.length === 1) {
      const endpoint = list[0];
      if (endpoint.isAvailable()) {
        return endpoint;
      }
      return null;
    }

    if (options.registry?.preferLocalActions && endpointList.hasLocal()) {
      const endpoint = endpointList.getNextLocalEndpoint();
      if (endpoint && endpoint.isAvailable()) {
        return endpoint;
      }
    }

    const availableEndpoints = list.filter((endpoint: Endpoint) => endpoint.isAvailable());
    if (availableEndpoints.length === 0) {
      return null;
    }

    return select(availableEndpoints);
  };

  endpointList.getNextLocalEndpoint = (): Endpoint | null => {
    if (endpointList.localEndpoints.length === 0) {
      return null;
    }

    if (list.length === 1) {
      const endpoint = endpointList.localEndpoints[0];
      if (endpoint.isAvailable()) {
        return endpoint;
      }
      return null;
    }

    const availableEndpoints = endpointList.localEndpoints.filter((endpoint: Endpoint) =>
      endpoint.isAvailable(),
    );
    if (availableEndpoints.length === 0) {
      return null;
    }

    return select(availableEndpoints);
  };

  endpointList.count = (): number => list.length;

  endpointList.getByNodeId = (nodeId: string): Endpoint | undefined =>
    list.find((endpoint: Endpoint) => endpoint.node.id === nodeId);

  endpointList.removeByNodeId = (nodeId: string): void => {
    const endpointToRemove = list.find((item: Endpoint) => item.node.id === nodeId);
    if (endpointToRemove) {
      list.splice(list.indexOf(endpointToRemove), 1);
    }
    setLocalEndpoints();
  };

  endpointList.removeByService = (service: ServiceItem): void => {
    const endpointToRemove = list.find((endpoint: Endpoint) => endpoint.service === service);
    if (endpointToRemove) {
      list.splice(list.indexOf(endpointToRemove), 1);
    }
    setLocalEndpoints();
  };

  return endpointList;
};
