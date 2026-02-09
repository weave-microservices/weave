/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import type { Endpoint, Node, Runtime, ServiceItem, WeaveAction } from "../../types/index.js";

/**
 * Action endpoint factory
 */
export const createActionEndpoint = (
  runtime: Runtime,
  node: Node,
  service: ServiceItem,
  action: WeaveAction,
): Endpoint => {
  const endpoint: Endpoint = {
    node,
    service,
    action,
    isLocal: node.id === runtime.nodeId,
    state: true,
    name: `${node.id}:${action.name}`,
    updateAction(newAction: WeaveAction): void {
      endpoint.action = newAction;
    },
    isAvailable(): boolean {
      return endpoint.state === true;
    },
  };

  return endpoint;
};
