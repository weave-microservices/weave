/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { InboundTransformStream } = require('./InboundTransformStream');
const { WeaveError, restoreError } = require('../errors');
import { ActionContext } from '../broker/ActionContext';
import { Runtime } from '../runtime/Runtime';
import { createEventHandler } from './createEventHandler';
import { createMessage } from './createMessage';
import { createPingHandler } from './createPingHandler';
import { createPongHandler } from './createPongHandler';
import { createRequestHandler } from './createRequesthandler';
import * as MessageTypes from './messageTypes';
import { PingPayload } from './PingPayload';
import { RequestPayload } from './RequestPayload';
import { Transport } from './Transport';
import { TransportMessage } from './TransportMessage';

class MessageHandler {
  #runtime: Runtime;
  #transport: Transport;
  #onRequest;
  #onEvent;
  #onPing;
  #onPong;

  constructor (runtime: Runtime, transport: Transport) { 
    this.#transport = transport;
    this.#runtime = runtime
    this.#onRequest = createRequestHandler({ runtime, transport })
    this.#onEvent = createEventHandler({ runtime, transport })
    this.#onPing = createPingHandler({ transport })
    this.#onPong = createPongHandler({ runtime })

  }

  public handle (type: string, data: TransportMessage) {
    try {
      if (data === null) {
        this.#runtime.handleError(new WeaveError('Packet missing!'));
      }

      const payload = data.payload;

      if (!payload) {
        this.#runtime.handleError(new WeaveError('Message payload missing!'));
      }

      // todo: check protocol version
      // todo: check node ID conflict

      // if (payload.sender === runtime.nodeId) {
      //   if (type === MessageTypes.MESSAGE_INFO && payload.instanceId !== runtime.state.instanceId) {
      //     return runtime.fatalError('Weave broker has detected a node ID conflict. "nodeId" of broker needs to be unique. Broker will be stopped.')
      //   }
      // }

      switch (type) {
        case MessageTypes.MESSAGE_DISCOVERY:
          onDiscovery(payload);
          break;
        case MessageTypes.MESSAGE_INFO:
          onNodeInfos(payload);
          break;
        case MessageTypes.MESSAGE_REQUEST:
          this.#onRequest(payload);
          break;
        case MessageTypes.MESSAGE_RESPONSE:
          onResponse(payload);
          break;
        case MessageTypes.MESSAGE_PING:
          this.#onPing(payload);
          break;
        case MessageTypes.MESSAGE_PONG:
          this.#onPong(payload);
          break;
        case MessageTypes.MESSAGE_DISCONNECT:
          onDisconnect(payload);
          break;
        case MessageTypes.MESSAGE_HEARTBEAT:
          onHeartbeat(payload);
          break;
        case MessageTypes.MESSAGE_EVENT:
          this.#onEvent(payload);
          break;
        case MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE:
          onResponseStreamBackpressure(payload);
          break;
        case MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME:
          onResponseStreamResume(payload);
          break;
        case MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE:
          onRequestStreamBackpressure(payload);
          break;
        case MessageTypes.MESSAGE_REQUEST_STREAM_RESUME:
          onRequestStreamResume(payload);
          break;
      }

      return true;
    } catch (error) {
      this.#transport.log.error(error, data);
    }
    return false;
  }
}

module.exports = (runtime: Runtime, transport: Transporter) => {
  const registry = runtime.registry;

  const getRequestTimeout = (payload) => {
    return payload.timeout || runtime.options.registry.requestTimeout || 0;
  };

  const localRequestProxy = (context: ActionContext) => {
    const actionName = context.action.name;

    // Get available endpoints
    const endpointList = registry.getActionEndpoints(actionName);

    // Reject the request if no local endpoint can be found.
    if (endpointList == null || !endpointList.hasLocal()) {
      transport.log.warn(`Service ${actionName} not found localy.`);
      return Promise.reject('Service not found');
    }

    // From all available local endpoints - get one.
    const endpoint = endpointList.getNextLocalEndpoint();

    // if there is no endpoint, reject
    if (!endpoint) {
      transport.log.warn(`Service ${actionName} is not available localy.`);
      return Promise.reject('Service not found');
    }

    // Call the local action handler with context
    const promise = endpoint.action.handler(context);
    promise.context = context;

    return promise;
  };


  const handleIncomingResponseStream = function (payload: any, request: any) {
    let stream = transport.pending.responseStreams.get(payload.id);

    if (!stream && !payload.isStream) {
      return false;
    }

    if (!stream) {
      transport.log.debug(`New stream from node ${payload.sender} received. Seq: ${payload.sequence}`);

      stream = new InboundTransformStream(
        payload.sender,
        payload.id, {
          objectMode: payload.meta && payload.meta.$isObjectModeStream
        }
      );

      // handle backpressure
      if (runtime.options.transport.streams.handleBackpressure) {
        stream.on('backpressure', async ({ sender, requestId }) => {
          const message = createMessage(MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE, sender, { id: requestId });
          await transport.send(message);
        });

        stream.on('resume_backpressure', async ({ sender, requestId }) => {
          const message = createMessage(MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME, sender, { id: requestId });
          await transport.send(message);
        });
      }

      stream.$prevSeq = -1;
      stream.$pool = new Map();

      transport.pending.responseStreams.set(payload.id, stream);
      request.resolve(stream);
    }

    if (payload.sequence > (stream.$prevSeq + 1)) {
      transport.log.debug(`Put the chunk into pool (size: ${stream.$pool.size}). Seq: ${payload.sequence}`);

      stream.$pool.set(payload.sequence, payload);
      return true;
    }

    stream.$prevSeq = payload.sequence;

    if (stream.$prevSeq > 0) {
      if (!payload.isStream) {
        transport.log.debug('Stream ended', payload.sender);

        // Todo: Handle errors

        // end of stream
        stream.end();
        transport.pending.responseStreams.delete(payload.id);
        return null;
      } else {
        transport.log.debug('Stream chunk received from ', payload.sender);
        stream.write(payload.chunk.type === 'Buffer' ? Buffer.from(payload.chunk.data) : payload.chunk);
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

  /**
   * Discovery handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onDiscovery = function (payload: any) {
    return transport.sendNodeInfo(payload.sender)
  };

  /**
   * Node info handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onNodeInfos = function (payload: any) {
    return registry.processNodeInfo(payload);
  }

 

  /**
   * Response handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onResponse = (payload) => {
    const id = payload.id;
    const request = transport.pending.requests.get(id);

    if (!request) {
      return Promise.resolve();
    }

    // Merge meta data from response
    Object.assign(request.context.meta, payload.meta);

    // Handle streams
    if (payload.isStream != null) {
      if (handleIncomingResponseStream(payload, request)) {
        return;
      }
    }

    transport.pending.requests.delete(payload.id);

    // Response is an error
    if (!payload.success) {
      let error = restoreError(payload.error);

      if (!error) {
        error = new Error(payload.error.message);
        error.name = payload.error.name;
        error.code = payload.error.code;
        error.type = payload.error.type;
        error.data = payload.error.data;
      }

      error.retryable = payload.error.retryable;
      error.nodeId = error.nodeId || payload.sender;

      if (payload.error.stack) {
        error.stack = payload.error.stack;
      }

      request.reject(error);
    }

    request.resolve(payload.data);
  };






  /**
   * Disconnect handler
   * @param {any} payload - Payload
   * @returns {void}
  */
  const onDisconnect = (payload) => {
    registry.nodeDisconnected(payload.sender, false);
  };

  /**
   * Heartbeat handler
   * @param {any} payload - Payload
   * @returns {void}
  */
  const onHeartbeat = (payload) => {
    transport.log.verbose(`Heartbeat from ${payload.sender}`);
    const node = registry.nodeCollection.get(payload.sender);
    // if node is unknown then request a node info message.
    if (node) {
      if (!node.isAvailable) {
        transport.log.debug('Known node. Propably reconnected.');
        // unknown node. request info message.
        transport.discoverNode(payload.sender);
      } else {
        node.heartbeat(payload);
      }
    } else {
      // unknown node. request info message.
      transport.discoverNode(payload.sender);
    }
  };

  const onResponseStreamBackpressure = (payload) => {
    const stream = transport.pending.outboundResponseStreams.get(payload.id);

    if (stream) {
      stream.pause();
    }
  };

  const onResponseStreamResume = (payload) => {
    const stream = transport.pending.outboundResponseStreams.get(payload.id);

    if (stream) {
      stream.resume();
    }
  };

  const onRequestStreamBackpressure = (payload) => {
    const stream = transport.pending.outboundRequestStreams.get(payload.id);

    if (stream) {
      stream.pause();
    }
  };

  const onRequestStreamResume = (payload) => {
    const stream = transport.pending.outboundRequestStreams.get(payload.id);

    if (stream) {
      stream.resume();
    }
  };

  return function (type: string, data: TransportMessage): boolean {
    try {
      if (data === null) {
        runtime.handleError(new WeaveError('Packet missing!'));
      }

      const payload = data.payload;

      if (!payload) {
        runtime.handleError(new WeaveError('Message payload missing!'));
      }

      // todo: check protocol version
      // todo: check node ID conflict

      // if (payload.sender === runtime.nodeId) {
      //   if (type === MessageTypes.MESSAGE_INFO && payload.instanceId !== runtime.state.instanceId) {
      //     return runtime.fatalError('Weave broker has detected a node ID conflict. "nodeId" of broker needs to be unique. Broker will be stopped.')
      //   }
      // }

      switch (type) {
        case MessageTypes.MESSAGE_DISCOVERY:
          onDiscovery(payload);
          break;
        case MessageTypes.MESSAGE_INFO:
          onNodeInfos(payload);
          break;
        case MessageTypes.MESSAGE_REQUEST:
          onRequest(payload);
          break;
        case MessageTypes.MESSAGE_RESPONSE:
          onResponse(payload);
          break;
        case MessageTypes.MESSAGE_PING:
          onPing(payload);
          break;
        case MessageTypes.MESSAGE_PONG:
          onPong(payload);
          break;
        case MessageTypes.MESSAGE_DISCONNECT:
          onDisconnect(payload);
          break;
        case MessageTypes.MESSAGE_HEARTBEAT:
          onHeartbeat(payload);
          break;
        case MessageTypes.MESSAGE_EVENT:
          onEvent(payload);
          break;
        case MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE:
          onResponseStreamBackpressure(payload);
          break;
        case MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME:
          onResponseStreamResume(payload);
          break;
        case MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE:
          onRequestStreamBackpressure(payload);
          break;
        case MessageTypes.MESSAGE_REQUEST_STREAM_RESUME:
          onRequestStreamResume(payload);
          break;
      }

      return true;
    } catch (error) {
      transport.log.error(error, data);
    }
    return false;
  };
};
