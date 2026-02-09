/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { InboundTransformStream } from "./InboundTransformStream.mts";
import { WeaveError } from "../errors.mts";
import { createContext } from "../broker/context.mts";
import { createMessage } from "./createMessage.mts";
import * as MessageTypes from "./messageTypes.mts";
import { restoreError } from "../utils/restoreError.mts";
import type {
  Runtime,
  Transport,
  TransportMessage,
  TransportMessageHandler,
  RequestPayload,
  ResponsePayload,
  EventPayload,
  HeartbeatPayload,
  PingPayload,
  InfoPayload,
  Context,
} from "../../types/index.js";

/**
 * Creates message handlers for transport layer
 * @param runtime - Runtime reference
 * @param transport - Transport reference
 * @returns Message handler function
 */
export default (runtime: Runtime, transport: Transport): TransportMessageHandler => {
  const registry = runtime.registry;

  const getRequestTimeout = (payload: RequestPayload): number => {
    return payload.timeout || runtime.options.registry?.requestTimeout || 0;
  };

  const localRequestProxy = (context: Context): Promise<unknown> => {
    const actionName = context.action.name;
    const availableEndpointList = registry.getActionEndpoints(actionName);

    if (availableEndpointList == null || !availableEndpointList.hasLocal()) {
      transport.log.warn(`Service ${actionName} not found localy.`);
      return Promise.reject("Service not found");
    }

    const endpoint = availableEndpointList.getNextLocalEndpoint();

    if (!endpoint) {
      transport.log.warn(`Service ${actionName} is not available localy.`);
      return Promise.reject("Service not found");
    }

    const promise = endpoint.action.handler(context, {
      service: endpoint.action.service,
      runtime,
      errors: {},
    }) as Promise<unknown> & { context?: Context };
    promise.context = context;

    return promise;
  };

  const handleIncomingRequestStream = (payload: RequestPayload): InboundTransformStream | false | null => {
    let stream = transport.pending.requestStreams.get(payload.id);
    let isNew = false;
    const sender = payload.sender || "";
    const sequence = payload.sequence ?? 0;

    if (!payload.isStream && !stream) {
      return false;
    }

    if (!stream) {
      isNew = true;
      stream = new InboundTransformStream(sender, payload.id, {
        objectMode: payload.meta && payload.meta.$isObjectModeStream,
      });

      if (runtime.options.transport?.streams?.handleBackpressure) {
        stream.on("backpressure", async ({ sender, requestId }: { sender: string; requestId: string }) => {
          const message = createMessage(MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE, sender, {
            id: requestId,
          });
          await transport.send(message);
        });

        stream.on("resume_backpressure", async ({ sender, requestId }: { sender: string; requestId: string }) => {
          const message = createMessage(MessageTypes.MESSAGE_REQUEST_STREAM_RESUME, sender, {
            id: requestId,
          });
          await transport.send(message);
        });
      }

      transport.pending.requestStreams.set(payload.id, stream);
    }

    if (sequence > stream.$prevSeq + 1) {
      stream.$pool.set(sequence, payload);
      return isNew ? stream : null;
    }

    stream.$prevSeq = sequence;

    if (stream.$prevSeq > 0) {
      if (!payload.isStream) {
        transport.log.debug("Stream ended", payload.sender);

        // Todo: Handle errors

        stream.end();
        transport.pending.requestStreams.delete(payload.id);
        return null;
      } else {
        transport.log.debug("Stream chunk received from ", payload.sender);
        stream.write(
          payload.chunk.type === "Buffer" ? Buffer.from(payload.chunk.data) : payload.chunk,
        );
      }
    }

    if (stream.$pool.size > 0) {
      transport.log.debug(`Stream has stored packages. Size: ${stream.$pool.size}`, payload.sender);
      const nextSequence = stream.$prevSeq + 1;
      const nextChunk = stream.$pool.get(nextSequence);
      if (nextChunk) {
        stream.$pool.delete(nextSequence);
        setImmediate(() => onRequest(nextChunk));
      }
    }

    return isNew ? stream : null;
  };

  interface PendingRequest {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    context: Context;
    timeout?: NodeJS.Timeout;
  }

  const handleIncomingResponseStream = (payload: ResponsePayload, request: PendingRequest): boolean | null => {
    let stream = transport.pending.responseStreams.get(payload.id);
    const sender = payload.sender || "";
    const sequence = payload.sequence ?? 0;

    if (!stream && !payload.isStream) {
      return false;
    }

    if (!stream) {
      transport.log.debug(
        `New stream from node ${sender} received. Seq: ${sequence}`,
      );

      stream = new InboundTransformStream(sender, payload.id, {
        objectMode: payload.meta && payload.meta.$isObjectModeStream,
      });

      if (runtime.options.transport?.streams?.handleBackpressure) {
        stream.on("backpressure", async ({ sender, requestId }: { sender: string; requestId: string }) => {
          const message = createMessage(MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE, sender, {
            id: requestId,
          });
          await transport.send(message);
        });

        stream.on("resume_backpressure", async ({ sender, requestId }: { sender: string; requestId: string }) => {
          const message = createMessage(MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME, sender, {
            id: requestId,
          });
          await transport.send(message);
        });
      }

      transport.pending.responseStreams.set(payload.id, stream);
      request.resolve(stream);
    }

    if (sequence > stream.$prevSeq + 1) {
      transport.log.debug(
        `Put the chunk into pool (size: ${stream.$pool.size}). Seq: ${sequence}`,
      );

      stream.$pool.set(sequence, payload);
      return true;
    }

    stream.$prevSeq = sequence;

    if (stream.$prevSeq > 0) {
      if (!payload.isStream) {
        transport.log.debug("Stream ended", payload.sender);

        // Todo: Handle errors

        stream.end();
        transport.pending.responseStreams.delete(payload.id);
        return null;
      } else {
        transport.log.debug("Stream chunk received from ", payload.sender);
        stream.write(
          payload.chunk.type === "Buffer" ? Buffer.from(payload.chunk.data) : payload.chunk,
        );
      }
    }

    if (stream.$pool.size > 0) {
      transport.log.debug(`Stream has stored packages. Size: ${stream.$pool.size}`, payload.sender);
      const nextSequence = stream.$prevSeq + 1;
      const nextChunk = stream.$pool.get(nextSequence);
      if (nextChunk) {
        stream.$pool.delete(nextSequence);
        setImmediate(() => onResponse(nextChunk));
      }
    }

    return true;
  };

  interface DiscoveryPayload {
    sender: string;
  }

  /**
   * Discovery handler
   */
  const onDiscovery = (payload: DiscoveryPayload): Promise<void> | undefined => transport.sendNodeInfo?.(payload.sender);

  /**
   * Node info handler
   */
  const onNodeInfos = (payload: InfoPayload): void => registry.processNodeInfo(payload);

  const onRequest = (payload: RequestPayload): Promise<void> => {
    const sender = payload.sender || "";

    try {
      let stream;
      if (payload.isStream) {
        stream = handleIncomingRequestStream(payload);
        if (!stream) {
          return Promise.resolve();
        }
      }

      const endpoint = registry.getLocalActionEndpoint(payload.action);
      const context = createContext(runtime);

      if (endpoint) {
        context.setEndpoint(endpoint);
      }
      context.id = payload.id;
      context.setData(payload.data);
      context.parentId = payload.parentId;
      context.requestId = payload.requestId;
      context.meta = payload.meta || {};
      context.metrics = payload.metrics;
      context.level = payload.level;
      context.callerNodeId = sender;
      context.tracing = payload.tracing;
      context.options.timeout = getRequestTimeout(payload);

      if (payload.isStream) {
        context.stream = stream;
      }

      return localRequestProxy(context)
        .then((data) => transport.sendResponse(sender, payload.id, data, context.meta, null))
        .catch((error: Error) => transport.sendResponse(sender, payload.id, null, context.meta, error));
    } catch (error: unknown) {
      return transport.sendResponse(sender, payload.id, null, payload.meta || {}, error as Error);
    }
  };

  const onResponse = (payload: ResponsePayload): void => {
    const id = payload.id;
    const request = transport.pending.requests.get(id) as PendingRequest | undefined;

    if (!request) {
      return;
    }

    Object.assign(request.context.meta, payload.meta);

    if (payload.isStream != null) {
      if (handleIncomingResponseStream(payload, request)) {
        return;
      }
    }

    transport.pending.requests.delete(payload.id);

    if (!payload.success) {
      const error = restoreError(payload.error) as Error & { nodeId?: string };

      error.nodeId = error.nodeId || payload.sender;

      request.reject(error);
    }

    request.resolve(payload.data);
  };

  /**
   * Ping handler
   */
  const onPing = (payload: PingPayload): Promise<void> => {
    const sender = payload.sender || "";
    const message = createMessage(MessageTypes.MESSAGE_PONG, sender, {
      dispatchTime: payload.dispatchTime,
      arrivalTime: Date.now(),
    });

    return transport.send(message);
  };

  interface PongPayload {
    sender: string;
    dispatchTime: number;
    arrivalTime: number;
  }

  /**
   * Pong handler
   */
  const onPong = (payload: PongPayload): void => {
    const now = Date.now();
    const elapsedTime = now - payload.dispatchTime;
    const timeDiff = Math.round(now - payload.arrivalTime - elapsedTime / 2);

    runtime.eventBus.broadcastLocal("$node.pong", {
      nodeId: payload.sender,
      elapsedTime,
      timeDiff,
    });
  };

  interface ExtendedEventPayload extends EventPayload {
    id?: string;
    timeout?: number;
  }

  /**
   * Event handler
   */
  const onEvent = (payload: ExtendedEventPayload): Promise<void> | undefined => {
    runtime.log.debug(`Received event "${payload.eventName}"`);

    if (!runtime.state.isStarted) {
      return;
    }

    // todo: reconstruct event context
    const context = createContext(runtime);

    // context.setEndpoint(endpoint)
    context.id = payload.id;
    context.setData(payload.data);
    context.parentId = payload.parentId;
    context.requestId = payload.requestId;
    context.meta = payload.meta || {};
    context.metrics = payload.metrics;
    context.level = payload.level ?? 1;
    context.callerNodeId = payload.sender;
    context.tracing = !!payload.tracing;

    if (payload.timeout) {
      context.options.timeout = payload.timeout;
    }

    context.eventName = payload.eventName;
    context.eventType = payload.isBroadcast ? "broadcast" : "emit";

    return registry.eventCollection.emitLocal(context);
  };

  interface DisconnectPayload {
    sender: string;
  }

  /**
   * Disconnect handler
   */
  const onDisconnect = (payload: DisconnectPayload): void => {
    registry.nodeDisconnected(payload.sender, false);
  };

  /**
   * Heartbeat handler
   */
  const onHeartbeat = (payload: HeartbeatPayload): void => {
    const sender = payload.sender || "";
    transport.log.verbose(`Heartbeat from ${sender}`);
    const node = registry.nodeCollection.get(sender);

    if (node) {
      if (!node.isAvailable) {
        transport.log.debug("Known node. Propably reconnected.");
        transport.discoverNode?.(sender);
      } else {
        node.heartbeat(payload);
      }
    } else {
      transport.discoverNode?.(sender);
    }
  };

  interface StreamBackpressurePayload {
    id: string;
  }

  const onResponseStreamBackpressure = (payload: StreamBackpressurePayload): void => {
    const stream = transport.pending.outboundResponseStreams.get(payload.id);

    if (stream) {
      stream.pause();
    }
  };

  const onResponseStreamResume = (payload: StreamBackpressurePayload): void => {
    const stream = transport.pending.outboundResponseStreams.get(payload.id);

    if (stream) {
      stream.resume();
    }
  };

  const onRequestStreamBackpressure = (payload: StreamBackpressurePayload): void => {
    const stream = transport.pending.outboundRequestStreams.get(payload.id);

    if (stream) {
      stream.pause();
    }
  };

  const onRequestStreamResume = (payload: StreamBackpressurePayload): void => {
    const stream = transport.pending.outboundRequestStreams.get(payload.id);

    if (stream) {
      stream.resume();
    }
  };

  return (type: string, data: TransportMessage | null): boolean => {
    try {
      if (data === null) {
        runtime.handleError(new WeaveError("Packet missing!"));
        return false;
      }

      const payload = data.payload;

      if (!payload) {
        runtime.handleError(new WeaveError("Message payload missing!"));
      }

      // todo: check protocol version
      // todo: check node ID conflict

      if (payload.sender === runtime.nodeId) {
        if (type === MessageTypes.MESSAGE_INFO && payload.instanceId !== runtime.state.instanceId) {
          runtime.fatalError(
            `Weave broker has detected a node ID conflict. "nodeId" of broker needs to be unique, but there is an broker with node ID "${runtime.nodeId}". Broker will be stopped.`,
          );
          return false;
        }
      }

      switch (type) {
        case MessageTypes.MESSAGE_DISCOVERY:
          onDiscovery(payload as DiscoveryPayload);
          break;
        case MessageTypes.MESSAGE_INFO:
          onNodeInfos(payload as InfoPayload);
          break;
        case MessageTypes.MESSAGE_REQUEST:
          onRequest(payload as RequestPayload);
          break;
        case MessageTypes.MESSAGE_RESPONSE:
          onResponse(payload as ResponsePayload);
          break;
        case MessageTypes.MESSAGE_PING:
          onPing(payload as PingPayload);
          break;
        case MessageTypes.MESSAGE_PONG:
          onPong(payload as PongPayload);
          break;
        case MessageTypes.MESSAGE_DISCONNECT:
          onDisconnect(payload as DisconnectPayload);
          break;
        case MessageTypes.MESSAGE_HEARTBEAT:
          onHeartbeat(payload as HeartbeatPayload);
          break;
        case MessageTypes.MESSAGE_EVENT:
          onEvent(payload as ExtendedEventPayload);
          break;
        case MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE:
          onResponseStreamBackpressure(payload as StreamBackpressurePayload);
          break;
        case MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME:
          onResponseStreamResume(payload as StreamBackpressurePayload);
          break;
        case MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE:
          onRequestStreamBackpressure(payload as StreamBackpressurePayload);
          break;
        case MessageTypes.MESSAGE_REQUEST_STREAM_RESUME:
          onRequestStreamResume(payload as StreamBackpressurePayload);
          break;
      }

      return true;
    } catch (error: unknown) {
      transport.log.error((error as Error).message || String(error), type);
      runtime.eventBus.broadcastLocal("$transport.error", { error });
    }
    return false;
  };
};
