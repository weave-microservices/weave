import { useEffect, useRef, useCallback } from "react";
import { useClusterStore } from "../stores/cluster";

interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Use getState() for stable references to avoid infinite loops
  const store = useClusterStore;
  const setConnected = store.getState().setConnected;
  const setInitialState = store.getState().setInitialState;
  const addNode = store.getState().addNode;
  const removeNode = store.getState().removeNode;
  const updateNode = store.getState().updateNode;
  const updateRegistry = store.getState().updateRegistry;
  const addPacket = store.getState().addPacket;
  const addCall = store.getState().addCall;
  const updateCall = store.getState().updateCall;

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onclose = () => {
      setConnected(false);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WebSocketMessage;

        switch (msg.type) {
          case "initial":
            setInitialState(msg.nodes as never[], msg.actions as never[], msg.events as never[]);
            break;

          case "node:connected":
            addNode(msg.node as never);
            break;

          case "node:disconnected":
            removeNode(msg.nodeId as string);
            break;

          case "node:updated":
            updateNode(msg.node as never);
            break;

          case "registry:updated":
            updateRegistry(msg.actions as never[], msg.events as never[]);
            break;

          case "packet":
            addPacket(msg.packet as never);
            break;

          case "call:result":
            updateCall(msg.id as string, {
              status: "success",
              result: msg.result,
              finishedAt: Date.now(),
            });
            break;

          case "call:error":
            updateCall(msg.id as string, {
              status: "error",
              error: msg.error as string,
              finishedAt: Date.now(),
            });
            break;
        }
      } catch {
        // Ignore parse errors
      }
    };

    return ws;
  }, []);

  const callAction = useCallback((action: string, params: unknown) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return null;
    }

    const id = crypto.randomUUID();
    const call = {
      id,
      action,
      params,
      status: "pending" as const,
      startedAt: Date.now(),
    };

    addCall(call);
    wsRef.current.send(JSON.stringify({ type: "call", id, action, params }));

    return id;
  }, []);

  useEffect(() => {
    const ws = connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      ws.close();
    };
  }, [connect]);

  return { callAction };
}
