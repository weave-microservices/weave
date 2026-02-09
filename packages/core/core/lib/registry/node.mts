/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { cpuUsage } from "@weave-js/utils";
import type { Node, NodeHeartbeatPayload, NodeUpdatePayload } from "../../types/index.js";

/**
 * Node factory
 */
export const createNode = (nodeId: string): Node => {
  return {
    id: nodeId,
    info: null,
    isLocal: false,
    client: {
      type: null,
      version: null,
    },
    cpu: null,
    cpuSequence: null,
    lastHeartbeatTime: Date.now(),
    offlineTime: null,
    isAvailable: true,
    isUnexpectedDisconnected: false,
    services: [],
    sequence: 0,
    events: null,
    IPList: [],
    update(payload: NodeUpdatePayload, isReconnected?: boolean): boolean {
      const newSequence = payload.sequence ?? 1;

      this.services = payload.services ?? [];
      this.events = payload.events ?? null;
      this.client = payload.client ?? { type: null, version: null };
      this.IPList = payload.IPList ?? [];
      this.info = payload as Node["info"];

      if (newSequence > this.sequence || isReconnected === true) {
        this.sequence = newSequence;
        this.offlineTime = null;

        return true;
      }
      return false;
    },
    updateLocalInfo(): void {
      cpuUsage().then((result: { avg: number }) => {
        const newVal = Math.round(result.avg);

        if (this.cpu !== newVal) {
          this.cpu = Math.round(result.avg);
          this.cpuSequence = (this.cpuSequence ?? 0) + 1;
        }
      });
    },
    heartbeat(payload: NodeHeartbeatPayload): void {
      if (!this.isAvailable) {
        this.isAvailable = true;
        this.offlineTime = null;
      }

      if (payload.cpu !== null && payload.cpu !== undefined) {
        this.cpu = payload.cpu;
        this.cpuSequence = payload.cpuSequence ?? 1;
      }

      this.lastHeartbeatTime = Date.now();
    },
    disconnected(isUnexpected = false): void {
      if (this.isAvailable) {
        this.offlineTime = Date.now();
        this.sequence++;
        this.isUnexpectedDisconnected = isUnexpected;
      }

      this.isAvailable = false;
    },
  };
};
