import { getRegistry } from "./registry.mts";
import type { RegistryActionEntry, RegistryEventEntry, RegistryNode } from "../types.mts";
import { WebSocketServer, WebSocket } from "ws";
import type { Server, IncomingMessage } from "http";
import type { Broker } from "@weave-js/core";
import type { PacketInfo } from "./packetTracker.mts";

export interface WebSocketContext {
  wss: WebSocketServer;
  broadcastPacket: (packet: PacketInfo) => void;
}

/**
 * Setup WebSocket server for real-time cluster updates
 */
export function setupWebSocket(
  server: Server,
  broker: Broker,
  token: string | null,
): WebSocketContext {
  const wss = new WebSocketServer({ server });
  const clients = new Set<WebSocket>();

  // Helper to broadcast updated actions and events
  const broadcastRegistryUpdate = () => {
    broadcast(clients, {
      type: "registry:updated",
      actions: serializeActions(getRegistry(broker).actionCollection.list({ withEndpoints: true })),
      events: serializeEvents(getRegistry(broker).eventCollection.list()),
    });
  };

  // Broker Events → WebSocket Broadcast
  broker.bus.on("$node.connected", ({ node }) => {
    broadcast(clients, { type: "node:connected", node: serializeNode(node) });
    // Actions/Events may have changed
    broadcastRegistryUpdate();
  });

  broker.bus.on("$node.disconnected", ({ nodeId }) => {
    broadcast(clients, { type: "node:disconnected", nodeId });
    // Actions/Events may have changed
    broadcastRegistryUpdate();
  });

  broker.bus.on("$node.updated", ({ node }) => {
    broadcast(clients, { type: "node:updated", node: serializeNode(node) });
  });

  // Service changes (local or remote)
  broker.bus.on("$services.changed", () => {
    broadcastRegistryUpdate();
  });

  wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
    // Auth check for WebSocket connection
    if (token) {
      const url = new URL(req.url || "/", `http://${req.headers.host}`);
      const queryToken = url.searchParams.get("token");
      if (queryToken !== token) {
        ws.close(1008, "Unauthorized");
        return;
      }
    }

    clients.add(ws);

    // Send initial state
    ws.send(
      JSON.stringify({
        type: "initial",
        nodes: getRegistry(broker).nodeCollection.list().map(serializeNode),
        actions: serializeActions(
          getRegistry(broker).actionCollection.list({ withEndpoints: true }),
        ),
        events: serializeEvents(getRegistry(broker).eventCollection.list()),
      }),
    );

    ws.on("message", async (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());

        if (msg.type === "call") {
          try {
            const result = await broker.call(msg.action, msg.params);
            ws.send(JSON.stringify({ type: "call:result", id: msg.id, result }));
          } catch (error) {
            ws.send(
              JSON.stringify({
                type: "call:error",
                id: msg.id,
                error: (error as Error).message,
              }),
            );
          }
        }
      } catch {
        ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  return {
    wss,
    broadcastPacket: (packet: PacketInfo) => {
      broadcast(clients, { type: "packet", packet });
    },
  };
}

function broadcast(clients: Set<WebSocket>, message: object) {
  const data = JSON.stringify(message);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function serializeNode(node: RegistryNode) {
  return {
    id: node.id,
    isLocal: node.isLocal,
    isAvailable: node.isAvailable,
    services: node.services?.map((service) => service.name) || [],
    client: node.client,
    cpu: node.cpu,
  };
}

function serializeActions(actions: RegistryActionEntry[]) {
  return actions.map((item) => ({
    name: item.action?.name,
    params: item.action?.params,
    count: item.count,
    hasAvailable: item.hasAvailable,
    hasLocal: item.hasLocal,
  }));
}

function serializeEvents(events: RegistryEventEntry[]) {
  return events.map((item) => ({
    name: item.name,
    group: item.groupName,
    count: item.count,
    hasAvailable: item.hasAvailable,
  }));
}
