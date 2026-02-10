/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import type { Endpoint, Node, Runtime, ServiceItem, ParsedAction } from "../../types/index.js";

/**
 * Action endpoint factory
 */
export const createActionEndpoint = (
  runtime: Runtime,
  node: Node,
  service: ServiceItem,
  action: ParsedAction,
): Endpoint => {
  const endpoint: Endpoint = {
    node,
    service,
    action,
    isLocal: node.id === runtime.nodeId,
    state: true,
    name: `${node.id}:${action.name}`,
    updateAction(newAction: ParsedAction): void {
      endpoint.action = newAction;
    },
    isAvailable(): boolean {
      return endpoint.state === true;
    },
  };

  return endpoint;
};
