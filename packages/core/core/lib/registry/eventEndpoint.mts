/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import type { Endpoint, Node, Runtime, ServiceItem, ParsedEvent } from "../../types/index.js";

/**
 * Event endpoint factory
 */
export const createEventEndpoint = (
  runtime: Runtime,
  node: Node,
  service: ServiceItem,
  event: ParsedEvent,
): Endpoint => {
  const endpoint: Endpoint = {
    node,
    service,
    action: event,
    isLocal: node.id === runtime.nodeId,
    state: true,
    name: `${node.id}:${event.name}`,
    updateAction(newEvent: ParsedEvent): void {
      endpoint.action = newEvent;
    },
    isAvailable(): boolean {
      return endpoint.state === true;
    },
  };

  return endpoint;
};
