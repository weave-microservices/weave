/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import type {
  Node,
  ServiceItem,
  ServiceSettings,
  ParsedAction,
  ParsedEvent,
} from "../../types/index.js";

/**
 * Service item factory
 */
export const createServiceItem = (
  node: Node,
  name: string,
  version: string | number | undefined,
  settings: ServiceSettings | undefined,
  isLocal: boolean,
): ServiceItem => {
  const actions: Record<string, ParsedAction> = {};
  const events: Record<string, ParsedEvent> = {};

  return {
    name,
    node,
    settings: settings ?? {},
    version,
    actions,
    events,
    isLocal,

    addAction(action: ParsedAction): void {
      actions[action.name] = action;
    },

    addEvent(event: ParsedEvent): void {
      events[event.name] = event;
    },

    equals(n: string, v?: string | number, nodeId?: string): boolean {
      return name === n && version === v && (nodeId == null || node.id === nodeId);
    },

    update(service: ServiceItem): void {
      this.settings = service.settings;
      this.version = service.version;
    },
  };
};
