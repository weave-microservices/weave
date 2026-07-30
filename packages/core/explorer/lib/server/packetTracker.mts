/**
 * Packet Tracker Middleware
 *
 * Intercepts all transport messages (incoming and outgoing) and emits them
 * to registered listeners for visualization in the Explorer UI.
 *
 * NOTE: This middleware must be registered BEFORE the broker starts,
 * otherwise the transport hooks won't be applied.
 */

import type { Middleware, Runtime } from "@weave-js/core";

export interface PacketInfo {
  id: string;
  type: string;
  direction: "in" | "out";
  sender: string;
  target: string | null;
  action?: string;
  event?: string;
  timestamp: number;
}

export type PacketListener = (packet: PacketInfo) => void;

export interface PacketTrackerMiddleware extends Middleware {
  addListener: (listener: PacketListener) => void;
  removeListener: (listener: PacketListener) => void;
}

interface TransportMessage {
  type: string;
  targetNodeId?: string;
  payload?: {
    id?: string;
    sender?: string;
    action?: string;
    eventName?: string;
  };
}

export function createPacketTrackerMiddleware(): PacketTrackerMiddleware {
  const listeners = new Set<PacketListener>();

  const emit = (packet: PacketInfo) => {
    for (const listener of listeners) {
      try {
        listener(packet);
      } catch {
        // Ignore listener errors
      }
    }
  };

  return {
    name: "PacketTracker",

    // Intercept outgoing packets
    transportSend(this: Runtime, next: (message: TransportMessage) => Promise<void>) {
      const nodeId = this.nodeId;
      console.log(nodeId);
      return async function (message: TransportMessage) {
        emit({
          id: message.payload?.id || crypto.randomUUID(),
          type: message.type,
          direction: "out",
          sender: nodeId,
          target: message.targetNodeId || null,
          action: message.payload?.action,
          event: message.payload?.eventName,
          timestamp: Date.now(),
        });

        return next(message);
      };
    },

    // Intercept incoming packets
    transportMessageHandler(
      this: Runtime,
      next: (type: string, data: TransportMessage | null) => boolean,
    ) {
      const nodeId = this.nodeId;
      console.log(nodeId);

      return function (type: string, data: TransportMessage | null) {
        if (data?.payload) {
          emit({
            id: data.payload.id || crypto.randomUUID(),
            type,
            direction: "in",
            sender: data.payload.sender || "unknown",
            target: nodeId,
            action: data.payload.action,
            event: data.payload.eventName,
            timestamp: Date.now(),
          });
        }

        return next(type, data);
      };
    },

    addListener(listener: PacketListener) {
      listeners.add(listener);
    },

    removeListener(listener: PacketListener) {
      listeners.delete(listener);
    },
  };
}
