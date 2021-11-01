/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

/**
 * @typedef {import('../types').Runtime} Runtime
 * @typedef {import('../types.js').TransportAdapter} TransportAdapter
 * @typedef {import('../types.js').Transport} Transport
 * @typedef {import('../types').TransportMessage} TransportMessage
 * @typedef {import('../types').Context} Context
*/

// Own packages
const { WeaveError, WeaveQueueSizeExceededError } = require('../errors')
const { createMessage } = require('./createMessage')
const MessageTypes = require('./message-types')
const utils = require('@weave-js/utils')
const createMessageHandler = require('./message-handlers')

const errorPayloadFactory = (runtime) => (error) => {
  return {
    name: error.name,
    message: error.message,
    nodeId: error.nodeId || runtime.nodeId,
    code: error.code,
    type: error.type,
    stack: error.stack,
    data: error.data
  }
}

/**
 * Create a Transport adapter
 * @param {Runtime} runtime Broker instance
 * @param {TransportAdapter} adapter Adapter wrapper
 * @returns {Transport} transport
*/
exports.createTransport = (runtime, adapter) => {
  const transport = Object.create(null)
  const { nodeId, middlewareHandler } = runtime

  let heartbeatTimer
  let checkNodesTimer
  let checkOfflineNodesTimer
  let updateLocalNodeTimer

  const log = runtime.createLogger('TRANSPORT')

  const pending = {
    requests: new Map(),
    requestStreams: new Map(),
    responseStreams: new Map(),
    outboundResponseStreams: new Map(),
    outboundRequestStreams: new Map()
  }

  // Outgoing request

  transport.log = runtime.createLogger('TRANSPORT')
  transport.isConnected = false
  transport.isDisconnecting = false
  transport.isReady = false
  transport.pending = pending
  transport.resolveConnect = null
  transport.adapterName = adapter.name
  transport.statistics = {
    received: {
      packages: 0
    },
    sent: {
      packages: 0
    }
  }

  const getErrorPayload = errorPayloadFactory(runtime)

  transport.connect = () => {
    return new Promise(resolve => {
      transport.resolveConnect = resolve
      transport.log.info('Connecting to transport adapter...')

      const doConnect = (isTryReconnect) => {
        let reconnectInProgress = false

        const errorHandler = (error) => {
          // Skip reconnect, if the adapter is disconnecting or an reconnect is in progress.
          if (transport.isDisconnecting || reconnectInProgress) {
            return
          }

          transport.log.warn('Connection failed')
          transport.log.debug(error)

          reconnectInProgress = true

          if (!error.skipRetry) {
            setTimeout(() => {
              transport.log.info('Reconnecting')
              doConnect(true)
            }, 5 * 1000)
          }
        }
        return adapter
          .connect(isTryReconnect, errorHandler)
          .catch(errorHandler)
      }

      doConnect(false)
    })
  }

  transport.disconnect = () => {
    transport.isDisconnecting = true
    transport.isConnected = false
    transport.isReady = false

    runtime.eventBus.broadcastLocal('$transporter.disconnected', { isGracefull: true })

    stopTimers()

    const message = createMessage(MessageTypes.MESSAGE_DISCONNECT)
    return transport.send(message)
      .then(() => {
        adapter.close()
      })
      .then(() => {
        transport.isDisconnecting = false
      })
  }

  transport.setReady = () => {
    if (transport.isConnected) {
      transport.isReady = true
      transport.sendNodeInfo()
    }
  }

  /**
   * Send node information.
   * @param {*} sender sender node ID.
   * @returns {Promise} Promise
  */
  transport.sendNodeInfo = (sender) => {
    if (!transport.isConnected || !transport.isReady) {
      return Promise.resolve()
    }

    const info = runtime.registry.getLocalNodeInfo()
    const message = createMessage(MessageTypes.MESSAGE_INFO, sender, {
      ...info,
      instanceId: runtime.state.instanceId
    })
    return transport.send(message)
  }

  /**
  * Send a message
  * @param {TransportMessage} message Message to send
  * @returns {Promise} Promise
  */
  transport.send = (message) => {
    transport.statistics.sent.packages = transport.statistics.sent.packages + 1
    log.verbose(`Send ${message.type.toUpperCase()} packet to ${message.targetNodeId || 'all nodes'}`)
    return adapter.preSend(message)
  }

  transport.sendPing = (nodeId) => {
    const pingMessage = createMessage(MessageTypes.MESSAGE_PING, nodeId, { dispatchTime: Date.now() })
    return transport.send(pingMessage)
  }

  /**
   * Send discovery message to all nodes.
   * @returns {void}
  */
  transport.discoverNodes = () => {
    const discoveryMessage = createMessage(MessageTypes.MESSAGE_DISCOVERY)
    transport.send(discoveryMessage)
  }

  /**
   * Send discovery message to all nodes.
   * @param{string} target - Target node ID
   * @returns {Promise<void>} - Promise
  */
  transport.discoverNode = (target) => {
    const discoveryMessage = createMessage(MessageTypes.MESSAGE_DISCOVERY, target)
    return transport.send(discoveryMessage)
  }

  /**
   * Send an event
   * @param {Context} context - Context
   * @returns {Promise<void>} - Promise
   */
  transport.sendEvent = (context) => {
    const isBroadcast = context.eventType === 'broadcast'

    const payload = {
      data: context.data,
      eventName: context.eventName,
      groups: context.eventGroups,
      meta: context.meta,
      level: context.level,
      metrics: context.metrics,
      requestId: context.requestId,
      parentId: context.parentId,
      isBroadcast
    }

    const message = createMessage(MessageTypes.MESSAGE_EVENT, context.endpoint ? context.nodeId : null, payload)
    return transport.send(message)
  }

  transport.sendBroadcastEvent = (nodeId, eventName, data, groups) => {
    log.verbose(`Send ${eventName} to ${nodeId}`)

    const payload = {
      data,
      eventName,
      groups,
      isBroadcast: true
    }

    const message = createMessage(MessageTypes.MESSAGE_EVENT, nodeId, payload)
    return transport.send(message)
  }

  transport.removePendingRequestsById = (requestId) => {
    pending.requests.delete(requestId)
    pending.requestStreams.delete(requestId)
    pending.responseStreams.delete(requestId)
    pending.outboundResponseStreams.delete(requestId)
    pending.outboundRequestStreams.delete(requestId)
  }

  transport.removePendingRequestsByNodeId = (nodeId) => {
    log.debug(`Remove pending requests for node ${nodeId}.`)
    pending.requests.forEach((request, requestId) => {
      if (request.nodeId === nodeId) {
        pending.requests.delete(requestId)
      }
      request.reject(new WeaveError(`Remove pending requests for node ${nodeId}.`))

      pending.requestStreams.delete(requestId)
      pending.responseStreams.delete(requestId)
    })
  }

  transport.sendRequest = (context) => {
    // If the queue size is set, check the queue size and reject the job when the limit is reached.
    if (runtime.options.transport.maxQueueSize && runtime.options.transport.maxQueueSize < pending.requests.size) {
      return Promise.reject(new WeaveQueueSizeExceededError({
        action: context.action.name,
        limit: runtime.options.transport.maxQueueSize,
        nodeId: context.nodeId,
        size: pending.requests.size
      }))
    }

    return new Promise((resolve, reject) => {
      const isStream = utils.isStream(context.options.stream)

      const request = {
        targetNodeId: context.nodeId,
        action: context.action.name,
        context,
        resolve,
        reject,
        isStream
      }

      log.debug(`Send request for ${request.action} to node ${request.targetNodeId}.`)

      pending.requests.set(context.id, request)

      const payload = {
        id: context.id,
        action: context.action.name,
        data: context.data,
        timeout: context.options.timeout,
        meta: context.meta,
        level: context.level,
        metrics: context.metrics,
        requestId: context.requestId,
        parentId: context.parentId,
        isStream
      }

      // Handle object mode streams
      if (isStream) {
        const stream = context.options.stream

        if (!pending.outboundRequestStreams.has(payload.id)) {
          pending.outboundRequestStreams.set(payload.id, stream)
        }

        if (utils.isStreamObjectMode(stream)) {
          payload.meta = payload.meta || {}
          payload.meta.$isObjectModeStream = true
        }
        payload.sequence = 0
      }

      const message = createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payload)

      return transport.send(message)
        .then(() => {
          // send stream
          if (isStream) {
            const stream = context.options.stream
            payload.meta = {}

            if (utils.isStreamObjectMode(context.options.stream)) {
              payload.meta.$isObjectModeStream = true
            }

            stream.on('data', data => {
              stream.pause()
              const chunks = []

              // The chunk is larger than maxBufferSize
              if (data instanceof Buffer && runtime.options.transport.maxChunkSize > 0 && data.length > runtime.options.transport.maxChunkSize) {
                const length = data.length
                let i = 0
                while (i < length) {
                  chunks.push(data.slice(i, i += runtime.options.transport.maxChunkSize))
                }
              } else {
                chunks.push(data)
              }

              // Send chunks from chunk buffer
              for (const chunk of chunks) {
                const payloadCopy = Object.assign({}, payload)
                payloadCopy.sequence = ++payload.sequence
                payloadCopy.chunk = chunk
                payloadCopy.isStream = true
                payload.data = null

                const message = createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy)
                transport.send(message)
              }

              // resume stream
              stream.resume()
              return
            })

            stream.on('end', () => {
              const payloadCopy = Object.assign({}, payload)

              payloadCopy.sequence = ++payload.sequence
              payloadCopy.chunk = null
              payloadCopy.isStream = false

              pending.outboundRequestStreams.delete(payload.id)

              const message = createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy)
              return transport.send(message)
            })

            stream.on('error', (error) => {
              const payloadCopy = Object.assign({}, payload)
              payloadCopy.sequence = ++payload.sequence
              payloadCopy.chunk = null
              payloadCopy.isStream = false

              if (error) {
                payloadCopy.success = false
                payloadCopy.error = getErrorPayload(error)
              }

              pending.outboundRequestStreams.delete(payload.id)

              const message = createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy)
              return transport.send(message)
            })
          }
        })
        .catch((error) => {
          reject(error)
        })
    })
  }

  /**
   * Send response for an open request.
   * @param {string} target - Target node ID
   * @param {string} contextId - Context ID
   * @param {any} data - Data
   * @param {Object} meta - Meta data
   * @param {WeaveError=} error - Error
   * @returns {Promise<void>} - Promise
  */
  transport.sendResponse = (target, contextId, data, meta, error) => {
    // Check if data is a stream
    const isStream = utils.isStream(data)

    // Build response payload
    const payload = {
      id: contextId,
      meta,
      data,
      success: error == null
    }

    // If an error is occurs, we attach the an error object to the payload.
    if (error) {
      payload.error = getErrorPayload(error)
    }

    if (isStream) {
      const stream = data

      if (!pending.outboundResponseStreams.has(payload.id)) {
        pending.outboundResponseStreams.set(payload.id, stream)
      }

      payload.data = null
      payload.sequence = 0
      payload.isStream = true

      if (utils.isStreamObjectMode(data)) {
        payload.meta = payload.meta || {}
        payload.meta.$isObjectModeStream = true
      }

      stream.pause()
      transport.log.debug('Send new stream chunk to ', target)

      stream.on('data', data => {
        stream.pause()
        const chunks = []

        // chunk is larger than maxBufferSize
        if (data instanceof Buffer && runtime.options.transport.maxChunkSize > 0 && data.length > runtime.options.transport.maxChunkSize) {
          const length = data.length
          let i = 0
          while (i < length) {
            chunks.push(data.slice(i, i += runtime.options.transport.maxChunkSize))
          }
        } else {
          chunks.push(data)
        }

        // Send chunks from chunk buffer
        for (const chunk of chunks) {
          const payloadCopy = Object.assign({}, payload)
          payloadCopy.sequence = ++payload.sequence

          payloadCopy.chunk = chunk
          transport.log.debug(`Send Stream chunk to ${target}`)

          const message = createMessage(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy)
          transport.send(message)
        }

        // resume stream
        stream.resume()
        return
      })

      stream.on('end', () => {
        const payloadCopy = Object.assign({}, payload)

        payloadCopy.sequence = ++payload.sequence
        payloadCopy.chunk = null
        payloadCopy.isStream = false

        transport.log.debug(`Send end stream chunk to ${target}`)

        const message = createMessage(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy)
        transport.send(message)
        pending.outboundResponseStreams.delete(payload.id)
      })

      stream.on('error', (error) => {
        const payloadCopy = Object.assign({}, payload)

        payloadCopy.sequence = ++payload.sequence
        payloadCopy.isStream = false
        payloadCopy.chunk = null

        if (error) {
          payloadCopy.success = false
          payloadCopy.error = getErrorPayload(error)
        }

        transport.log.debug(`Send closing chunk to ${target}`)

        const message = createMessage(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy)
        transport.send(message)
        pending.outboundResponseStreams.delete(payload.id)
      })

      payload.data = null
      const message = createMessage(MessageTypes.MESSAGE_RESPONSE, target, payload)
      return transport.send(message)
        .then(() => stream.resume())
    }

    const message = createMessage(MessageTypes.MESSAGE_RESPONSE, target, payload)
    return transport.send(message)
  }

  const onConnect = ({ wasReconnect = false, useHeartbeatTimer = true, useRemoteNodeCheckTimer = true, useOfflineCheckTimer = true }) =>
    Promise.resolve()
      .then(() => {
        if (!wasReconnect) {
          return makeSubscriptions()
        }
      })
      .then(() => transport.discoverNodes())
      .then(() => utils.promiseDelay(Promise.resolve(), 500))
      .then(() => {
        transport.isConnected = true

        runtime.eventBus.broadcastLocal('$transporter.connected', { wasReconnect })

        if (transport.resolveConnect) {
          transport.resolveConnect()
          transport.resolveConnect = null
        }
      })
      .then(() => {
        startUpdateLocalNodeTimer()

        if (useHeartbeatTimer) {
          startHeartbeatTimer()
        }

        if (useRemoteNodeCheckTimer) {
          startRemoteNodeCheckTimer()
        }

        if (useOfflineCheckTimer) {
          startOfflineNodeCheckTimer()
        }
      })

  const onDisconnect = () => {
    Promise.resolve()
      .then(() => {
        transport.isConnected = false
        runtime.bus.emit('$transporter.disconnected')
      })
      .then(() => {
        stopTimers()
      })
  }

  let messageHandler = createMessageHandler(runtime, transport)

  // Wrap message handler for middlewares
  messageHandler = middlewareHandler.wrapMethod('transportMessageHandler', messageHandler, transport)

  adapter.init(runtime, transport)
    .then(() => {
      adapter.bus.on('$adapter.connected', onConnect)
      adapter.bus.on('$adapter.disconnected', onDisconnect)
      adapter.bus.on('$adapter.message', messageHandler)
    })

  transport.send = middlewareHandler.wrapMethod('transportSend', transport.send, transport)

  return transport

  function makeSubscriptions () {
    return Promise.all([
      adapter.subscribe(MessageTypes.MESSAGE_DISCOVERY),
      adapter.subscribe(MessageTypes.MESSAGE_DISCOVERY, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_INFO),
      adapter.subscribe(MessageTypes.MESSAGE_INFO, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_REQUEST, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_RESPONSE, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_PING, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_PONG, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_DISCONNECT),
      adapter.subscribe(MessageTypes.MESSAGE_HEARTBEAT),
      adapter.subscribe(MessageTypes.MESSAGE_EVENT, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE, nodeId),
      adapter.subscribe(MessageTypes.MESSAGE_REQUEST_STREAM_RESUME, nodeId)
    ])
  }

  function startHeartbeatTimer () {
    heartbeatTimer = setInterval(() => sendHeartbeat(), runtime.options.transport.heartbeatInterval)
    heartbeatTimer.unref()
  }

  function startRemoteNodeCheckTimer () {
    checkNodesTimer = setInterval(() => checkRemoteNodes(), runtime.options.transport.heartbeatTimeout)
    checkNodesTimer.unref()
  }

  function startOfflineNodeCheckTimer () {
    checkOfflineNodesTimer = setInterval(() => checkOfflineNodes(), runtime.options.transport.offlineNodeCheckInterval)
    checkOfflineNodesTimer.unref()
  }

  function startUpdateLocalNodeTimer () {
    updateLocalNodeTimer = setInterval(() => {
      const node = runtime.registry.nodeCollection.localNode
      node.updateLocalInfo(true)
    }, runtime.options.transport.localNodeUpdateInterval)

    updateLocalNodeTimer.unref()
  }

  function stopTimers () {
    clearInterval(heartbeatTimer)
    clearInterval(checkNodesTimer)
    clearInterval(checkOfflineNodesTimer)
    clearInterval(updateLocalNodeTimer)
  }

  function sendHeartbeat () {
    const node = runtime.registry.nodeCollection.localNode
    node.updateLocalInfo()

    log.verbose(`Send heartbeat from ${node.id}`)

    const payload = {
      cpu: node.cpu,
      cpuSequence: node.cpuSequence,
      sequence: node.sequence
    }

    const message = createMessage(MessageTypes.MESSAGE_HEARTBEAT, null, payload)
    transport.send(message)
  }

  function checkRemoteNodes () {
    const now = Date.now()
    runtime.registry.nodeCollection.list({ withServices: true }).forEach(node => {
      if (node.isLocal || !node.isAvailable) {
        return
      }

      if (now - (node.lastHeartbeatTime || 0) > runtime.options.transport.heartbeatTimeout) {
        runtime.registry.nodeDisconnected(node.id, true)
      }
    })
  }

  // Removes the node after a given time from the registry.
  function checkOfflineNodes () {
    const now = Date.now()
    runtime.registry.nodeCollection.list({}).forEach(node => {
      if (node.isLocal || node.isAvailable) {
        return
      }

      if ((now - node.offlineTime) > runtime.options.transport.maxOfflineTime) {
        runtime.registry.removeNode(node.id)
      }
    })
  }
}
