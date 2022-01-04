/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

const { InboundTransformStream } = require('./InboundTransformStream')
const { WeaveError, restoreError } = require('../errors')
const { createContext } = require('../broker/context')
const { createMessage } = require('./createMessage')
const MessageTypes = require('./message-types')

/**
 * @typedef {import('../types').Transport} Transport
 * @typedef {import('../types').Runtime} Runtime
 * @typedef {import('../types').TransportMessageHandler} TransportMessageHandler
*/

/**
 * @param {Runtime} runtime - Runtime reference
 * @param {Transport} transport - Transport refence
 * @returns {TransportMessageHandler} - Message handler
 */
module.exports = (runtime, transport) => {
  const registry = runtime.registry

  const getRequestTimeout = (payload) => {
    return payload.timeout || runtime.options.registry.requestTimeout || 0
  }

  const localRequestProxy = (context) => {
    const actionName = context.action.name

    // Get available endpoints
    const endpointList = registry.getActionEndpoints(actionName)

    // Reject the request if no local endpoint can be found.
    if (endpointList == null || !endpointList.hasLocal()) {
      transport.log.warn(`Service ${actionName} not found localy.`)
      return Promise.reject('Service not found')
    }

    // From all available local endpoints - get one.
    const endpoint = endpointList.getNextLocalEndpoint()

    // if there is no endpoint, reject
    if (!endpoint) {
      transport.log.warn(`Service ${actionName} is not available localy.`)
      return Promise.reject('Service not found')
    }

    // Call the local action handler with context
    const promise = endpoint.action.handler(context)
    promise.context = context

    return promise
  }

  const handleIncomingRequestStream = (payload) => {
    // check for open stream.
    let stream = transport.pending.requestStreams.get(payload.id)
    let isNew = false

    if (!payload.isStream && !stream) {
      return false
    }

    if (!stream) {
      isNew = true
      stream = new InboundTransformStream(
        payload.sender,
        payload.id, {
          objectMode: payload.meta && payload.meta.$isObjectModeStream
        }
      )

      // handle backpressure
      if (runtime.options.transport.streams.handleBackpressure) {
        stream.on('backpressure', async ({ sender, requestId }) => {
          const message = createMessage(MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE, sender, { id: requestId })
          await transport.send(message)
        })

        stream.on('resume_backpressure', async ({ sender, requestId }) => {
          const message = createMessage(MessageTypes.MESSAGE_REQUEST_STREAM_RESUME, sender, { id: requestId })
          await transport.send(message)
        })
      }

      stream.$prevSeq = -1
      stream.$pool = new Map()

      transport.pending.requestStreams.set(payload.id, stream)
    }

    if (payload.sequence > (stream.$prevSeq + 1)) {
      stream.$pool.set(payload.sequence, payload)
      return isNew ? stream : null
    }

    stream.$prevSeq = payload.sequence

    if (stream.$prevSeq > 0) {
      if (!payload.isStream) {
        transport.log.debug('Stream ended', payload.sender)

        // Todo: Handle errors

        // end of stream
        stream.end()
        transport.pending.requestStreams.delete(payload.id)
        return null
      } else {
        transport.log.debug('Stream chunk received from ', payload.sender)
        stream.write(payload.chunk.type === 'Buffer' ? Buffer.from(payload.chunk.data) : payload.chunk)
      }
    }

    if (stream.$pool.size > 0) {
      transport.log.debug(`Stream has stored packages. Size: ${stream.$pool.size}`, payload.sender)
      const nextSequence = stream.$prevSeq + 1
      const nextChunk = stream.$pool.get(nextSequence)
      if (nextChunk) {
        stream.$pool.delete(nextSequence)
        setImmediate(() => onRequest(nextChunk))
      }
    }

    return isNew ? stream : null
  }

  const handleIncomingResponseStream = (payload, request) => {
    let stream = transport.pending.responseStreams.get(payload.id)

    if (!stream && !payload.isStream) {
      return false
    }

    if (!stream) {
      transport.log.debug(`New stream from node ${payload.sender} received. Seq: ${payload.sequence}`)

      stream = new InboundTransformStream(
        payload.sender,
        payload.id, {
          objectMode: payload.meta && payload.meta.$isObjectModeStream
        }
      )

      // handle backpressure
      if (runtime.options.transport.streams.handleBackpressure) {
        stream.on('backpressure', async ({ sender, requestId }) => {
          const message = createMessage(MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE, sender, { id: requestId })
          await transport.send(message)
        })

        stream.on('resume_backpressure', async ({ sender, requestId }) => {
          const message = createMessage(MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME, sender, { id: requestId })
          await transport.send(message)
        })
      }

      stream.$prevSeq = -1
      stream.$pool = new Map()

      transport.pending.responseStreams.set(payload.id, stream)
      request.resolve(stream)
    }

    if (payload.sequence > (stream.$prevSeq + 1)) {
      transport.log.debug(`Put the chunk into pool (size: ${stream.$pool.size}). Seq: ${payload.sequence}`)

      stream.$pool.set(payload.sequence, payload)
      return true
    }

    stream.$prevSeq = payload.sequence

    if (stream.$prevSeq > 0) {
      if (!payload.isStream) {
        transport.log.debug('Stream ended', payload.sender)

        // Todo: Handle errors

        // end of stream
        stream.end()
        transport.pending.responseStreams.delete(payload.id)
        return null
      } else {
        transport.log.debug('Stream chunk received from ', payload.sender)
        stream.write(payload.chunk.type === 'Buffer' ? Buffer.from(payload.chunk.data) : payload.chunk)
      }
    }

    if (stream.$pool.size > 0) {
      transport.log.debug(`Stream has stored packages. Size: ${stream.$pool.size}`, payload.sender)
      const nextSequence = stream.$prevSeq + 1
      const nextChunk = stream.$pool.get(nextSequence)
      if (nextChunk) {
        stream.$pool.delete(nextSequence)
        setImmediate(() => onResponse(nextChunk))
      }
    }

    return true
  }

  /**
   * Discovery handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onDiscovery = (payload) => transport.sendNodeInfo(payload.sender)

  /**
   * Node info handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onNodeInfos = (payload) => registry.processNodeInfo(payload)

  /**
   * Request handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onRequest = (payload) => {
    const sender = payload.sender
    try {
      let stream

      // Handle incomming stream
      if (payload.isStream !== undefined) {
        // check for open stream.
        stream = handleIncomingRequestStream(payload)
        if (!stream) {
          return Promise.resolve()
        }
      }

      const endpoint = registry.getLocalActionEndpoint(payload.action)
      const context = createContext(runtime)

      context.setEndpoint(endpoint)
      context.id = payload.id
      context.setData(payload.data)
      context.parentId = payload.parentId
      context.requestId = payload.requestId
      context.meta = payload.meta || {}
      context.metrics = payload.metrics
      context.level = payload.level
      context.callerNodeId = payload.sender
      context.options.timeout = getRequestTimeout(payload)

      // If payload is a stream, attach stream to context
      if (payload.isStream) {
        context.stream = stream
      }

      return localRequestProxy(context)
        .then(data => transport.sendResponse(sender, payload.id, data, context.meta, null))
        .catch(error => transport.sendResponse(sender, payload.id, null, context.meta, error))
    } catch (error) {
      return transport.sendResponse(sender, payload.id, null, payload.meta, error)
    }
  }

  /**
   * Response handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onResponse = (payload) => {
    const id = payload.id
    const request = transport.pending.requests.get(id)

    if (!request) {
      return Promise.resolve()
    }

    // Merge meta data from response
    Object.assign(request.context.meta, payload.meta)

    // Handle streams
    if (payload.isStream != null) {
      if (handleIncomingResponseStream(payload, request)) {
        return
      }
    }

    transport.pending.requests.delete(payload.id)

    // Response is an error
    if (!payload.success) {
      let error = restoreError(payload.error)

      if (!error) {
        error = new Error(payload.error.message)
        error.name = payload.error.name
        error.code = payload.error.code
        error.type = payload.error.type
        error.data = payload.error.data
      }

      error.retryable = payload.error.retryable
      error.nodeId = error.nodeId || payload.sender

      if (payload.error.stack) {
        error.stack = payload.error.stack
      }

      request.reject(error)
    }

    request.resolve(payload.data)
  }

  /**
   * Ping handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onPing = payload => {
    const message = createMessage(MessageTypes.MESSAGE_PONG, payload.sender, {
      dispatchTime: payload.dispatchTime,
      arrivalTime: Date.now()
    })

    return transport.send(message)
  }

  /**
   * Pong handler
   * @param {any} payload - Payload
   * @returns {void}
  */
  const onPong = (payload) => {
    const now = Date.now()
    const elapsedTime = now - payload.dispatchTime
    const timeDiff = Math.round(now - payload.arrivalTime - elapsedTime / 2)

    runtime.eventBus.broadcastLocal('$node.pong', {
      nodeId: payload.sender,
      elapsedTime,
      timeDiff
    })
  }

  /**
   * Event handler
   * @param {any} payload - Payload
   * @returns {Promise} Promise
  */
  const onEvent = (payload) => {
    runtime.log.debug(`Received event "${payload.eventName}"`)

    if (!runtime.state.isStarted) {
      return
    }

    // todo: reconstruct event context
    const context = createContext(runtime)

    // context.setEndpoint(endpoint)
    context.id = payload.id
    context.setData(payload.data)
    context.parentId = payload.parentId
    context.requestId = payload.requestId
    context.meta = payload.meta || {}
    context.metrics = payload.metrics
    context.level = payload.level
    context.callerNodeId = payload.sender

    if (payload.timeout) {
      context.options.timeout = payload.timeout
    }

    // add event infos
    context.eventName = payload.eventName
    context.eventType = payload.isBroadcast ? 'broadcast' : 'emit'

    return registry.eventCollection.emitLocal(context)
  }

  /**
   * Disconnect handler
   * @param {any} payload - Payload
   * @returns {void}
  */
  const onDisconnect = (payload) => {
    registry.nodeDisconnected(payload.sender, false)
  }

  /**
   * Heartbeat handler
   * @param {any} payload - Payload
   * @returns {void}
  */
  const onHeartbeat = (payload) => {
    transport.log.verbose(`Heartbeat from ${payload.sender}`)
    const node = registry.nodeCollection.get(payload.sender)
    // if node is unknown then request a node info message.
    if (node) {
      if (!node.isAvailable) {
        transport.log.debug('Known node. Propably reconnected.')
        // unknown node. request info message.
        transport.discoverNode(payload.sender)
      } else {
        node.heartbeat(payload)
      }
    } else {
      // unknown node. request info message.
      transport.discoverNode(payload.sender)
    }
  }

  const onResponseStreamBackpressure = (payload) => {
    const stream = transport.pending.outboundResponseStreams.get(payload.id)

    if (stream) {
      stream.pause()
    }
  }

  const onResponseStreamResume = (payload) => {
    const stream = transport.pending.outboundResponseStreams.get(payload.id)

    if (stream) {
      stream.resume()
    }
  }

  const onRequestStreamBackpressure = (payload) => {
    const stream = transport.pending.outboundRequestStreams.get(payload.id)

    if (stream) {
      stream.pause()
    }
  }

  const onRequestStreamResume = (payload) => {
    const stream = transport.pending.outboundRequestStreams.get(payload.id)

    if (stream) {
      stream.resume()
    }
  }

  return (type, data) => {
    try {
      if (data === null) {
        runtime.handleError(new WeaveError('Packet missing!'))
      }

      const payload = data.payload

      if (!payload) {
        runtime.handleError(new WeaveError('Message payload missing!'))
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
        onDiscovery(payload)
        break
      case MessageTypes.MESSAGE_INFO:
        onNodeInfos(payload)
        break
      case MessageTypes.MESSAGE_REQUEST:
        onRequest(payload)
        break
      case MessageTypes.MESSAGE_RESPONSE:
        onResponse(payload)
        break
      case MessageTypes.MESSAGE_PING:
        onPing(payload)
        break
      case MessageTypes.MESSAGE_PONG:
        onPong(payload)
        break
      case MessageTypes.MESSAGE_DISCONNECT:
        onDisconnect(payload)
        break
      case MessageTypes.MESSAGE_HEARTBEAT:
        onHeartbeat(payload)
        break
      case MessageTypes.MESSAGE_EVENT:
        onEvent(payload)
        break
      case MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE:
        onResponseStreamBackpressure(payload)
        break
      case MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME:
        onResponseStreamResume(payload)
        break
      case MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE:
        onRequestStreamBackpressure(payload)
        break
      case MessageTypes.MESSAGE_REQUEST_STREAM_RESUME:
        onRequestStreamResume(payload)
        break
      }

      return true
    } catch (error) {
      transport.log.error(error, data)
    }
    return false
  }
}
