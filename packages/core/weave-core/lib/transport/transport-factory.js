/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

// Own packages
const { WeaveError, WeaveQueueSizeExceededError } = require('../errors')
const MessageTypes = require('./message-types')
const utils = require('../../../weave-utils/lib')
const createMessageHandler = require('./message-handlers')

/**
 * Create a Transport adapter
 * @param {BrokerInstance} broker Borker instance
 * @param {Object} adapter Adapter wrapper
 * @returns {Transport} transport
 */
exports.createTransport = (broker, adapter) => {
  let heartbeatTimer
  let checkNodesTimer
  let checkOfflineNodesTimer
  let updateLocalNodeTimer

  const nodeId = broker.nodeId
  const log = broker.createLogger('TRANSPORT')

  const pending = {
    requests: new Map(),
    requestStreams: new Map(),
    responseStreams: new Map()
  }

  const doRequest = (context, resolve, reject) => {
    const isStream = utils.isStream(context.data)

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
      data: isStream ? null : context.data,
      options: {
        timeout: context.options.timeout,
        retries: context.options.retries
      },
      meta: context.meta,
      level: context.level,
      metrics: context.metrics,
      requestId: context.requestId,
      parentId: context.parentId,
      isStream
    }

    if (isStream && utils.isStreamObjectMode(context.data)) {
      payload.meta = payload.meta || {}
      payload.meta.$isObjectModeStream = true
    }

    const message = transport.createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payload)

    return transport.send(message)
      .then(() => {
        if (isStream) {
          const stream = context.data
          payload.meta = {}

          if (utils.isStreamObjectMode(context.data)) {
            payload.meta.$isObjectModeStream = true
          }

          stream.on('data', chunk => {
            const payloadCopy = Object.assign({}, payload)

            payloadCopy.data = chunk
            stream.pause()

            return transport.send(transport.createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy))
              .then(() => stream.resume())
          })

          stream.on('end', () => {
            const payloadCopy = Object.assign({}, payload)
            payloadCopy.data = null
            payloadCopy.isStream = false
            return transport.send(transport.createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy))
          })

          stream.on('error', (bhunk) => {
            return transport.send(transport.createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payload))
          })
        }
      })
  }

  const transport = {
    log: broker.createLogger('TRANSPORT'),
    isConnected: false,
    isReady: false,
    pending,
    resolveConnect: null,
    adapterName: adapter.name,
    statistics: {
      received: {
        packages: 0
      },
      sent: {
        packages: 0
      }
    },
    connect () {
      return new Promise(resolve => {
        this.resolveConnect = resolve
        this.log.info('Connecting to transport adapter...')

        const doConnect = (isTryReconnect) => {
          const errorHandler = error => {
            this.log.warn('Connection failed')
            this.log.debug('Error ' + error.message)

            if (!error.skipRetry) {
              setTimeout(() => {
                this.log.info('Reconnecting')
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
    },
    disconnect () {
      broker.broadcastLocal('$transporter.disconnected', { isGracefull: true })

      this.isConnected = false
      this.isReady = false

      stopTimers()

      return this.send(this.createMessage(MessageTypes.MESSAGE_DISCONNECT))
        .then(() => adapter.close())
    },
    setReady () {
      if (this.isConnected) {
        this.isReady = true
        this.sendNodeInfo()
      }
    },
    sendNodeInfo (sender) {
      if (!transport.isConnected || !transport.isReady) {
        return Promise.resolve()
      }

      const info = broker.registry.getLocalNodeInfo()
      return this.send(this.createMessage(MessageTypes.MESSAGE_INFO, sender, info))
    },
    /**
      *
      * Send a message
      * @param {Message} message Message to send
      * @returns {Promise} Promise
    */
    send (message) {
      this.statistics.sent.packages = this.statistics.sent.packages + 1
      log.trace(`Send ${message.type.toUpperCase()} packet to ${message.targetNodeId || 'all nodes'}`)
      return adapter.preSend(message)
    },
    sendPing (nodeId) {
      return this.send(this.createMessage(MessageTypes.MESSAGE_PING, nodeId, { dispatchTime: Date.now() }))
    },
    discoverNodes () {
      this.send(this.createMessage(MessageTypes.MESSAGE_DISCOVERY))
    },
    discoverNode (target) {
      this.send(this.createMessage(MessageTypes.MESSAGE_DISCOVERY, target))
    },
    sendBalancedEvent (eventName, data, nodeGroups) {
      Object.keys(nodeGroups)
        .map(nodeId => [nodeId, nodeGroups[nodeId]])
        .map(([nodeId, groups]) => {
          this.send(this.createMessage(MessageTypes.MESSAGE_EVENT, nodeId, {
            data,
            eventName,
            groups,
            isBroadcast: false
          }))
        })
    },
    sendEvent (context) {
      const isBroadcast = context.eventType === 'broadcast'
      return this.send(this.createMessage(MessageTypes.MESSAGE_EVENT, context.endpoint ? context.nodeId : null, {
        data: context.data,
        eventName: context.eventName,
        groups: context.eventGroups,
        options: context.options,
        isBroadcast
      }))
      // const nodeGroups = context.nodeGroups
      // Object.keys(nodeGroups)
      //   .map(nodeId => [nodeId, nodeGroups[nodeId]])
      //   .map(([nodeId, groups]) => {
      //     this.send(this.createMessage(MessageTypes.MESSAGE_EVENT, nodeId, {
      //       data,
      //       eventName,
      //       groups,
      //       isBroadcast: false
      //     }))
      //   })
    },
    sendBroadcastEvent (nodeId, eventName, data, groups) {
      log.trace(`Send ${eventName} to ${nodeId}`)
      this.send(this.createMessage(MessageTypes.MESSAGE_EVENT, nodeId, {
        data,
        eventName,
        groups,
        isBroadcast: true
      }))
    },
    removePendingRequestsById (requestId) {
      pending.requests.delete(requestId)
      pending.requestStreams.delete(requestId)
      pending.responseStreams.delete(requestId)
    },
    removePendingRequestsByNodeId (nodeId) {
      log.debug(`Remove pending requests for node ${nodeId}.`)
      pending.requests.forEach((request, requestId) => {
        if (request.nodeId === nodeId) {
          pending.requests.delete(requestId)
        }
        request.reject(new WeaveError(`Remove pending requests for node ${nodeId}.`))

        pending.requestStreams.delete(requestId)
        pending.responseStreams.delete(requestId)
      })
    },
    createMessage (type, targetNodeId, payload) {
      return {
        type: type || MessageTypes.MESSAGE_UNKNOWN,
        targetNodeId,
        payload: payload || {}
      }
    },
    request (context) {
      // If the queue size is set, check the queue size and reject the job when the limit is reached.
      if (broker.options.transport.maxQueueSize && broker.options.transport.maxQueueSize < pending.requests.size) {
        return Promise.reject(new WeaveQueueSizeExceededError({
          action: context.action.name,
          limit: broker.options.transport.maxQueueSize,
          nodeId: context.nodeId,
          size: pending.requests.size
        }))
      }

      return new Promise((resolve, reject) => doRequest(context, resolve, reject))
    },
    response (target, contextId, data, meta, error) {
      // Check if data is a stream
      const isStream = utils.isStream(data)
      const payload = {
        id: contextId,
        meta,
        data,
        success: error == null
      }

      if (error) {
        payload.error = {
          name: error.name,
          message: error.message,
          nodeId: error.nodeId || nodeId,
          code: error.code,
          type: error.type,
          stack: error.stack,
          data: error.data
        }
      }

      if (isStream) {
        const stream = data
        payload.sequence = 0
        payload.isStream = true

        if (utils.isStreamObjectMode(data)) {
          payload.meta = payload.meta || {}
          payload.meta.$isObjectModeStream = true
        }

        stream.pause()
        this.log.debug('Send new stream chunk to ', target)

        stream.on('data', chunk => {
          const payloadCopy = Object.assign({}, payload)
          payloadCopy.sequence = ++payload.sequence
          payloadCopy.data = chunk
          this.log.debug('Send Stream chunk to ', target)
          stream.pause()
          return this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy))
            .then(() => stream.resume())
        })

        stream.on('end', () => {
          const payloadCopy = Object.assign({}, payload)

          payloadCopy.sequence = ++payload.sequence
          payloadCopy.data = null
          payloadCopy.isStream = false

          this.log.debug('Send end stream chunk to ', target)
          this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy))
        })

        stream.on('error', (error) => {
          const payloadCopy = Object.assign({}, payload)

          payloadCopy.sequence = ++payload.sequence
          payloadCopy.isStream = false

          if (error) {
            payloadCopy.success = false
          }

          this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy))
        })

        payload.data = null

        return this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payload))
          .then(() => stream.resume())
      }

      return this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payload))
    }
  }

  const onConnect = (wasReconnect, useHeartbeatTimer = true, useRemoteNodeCheckTimer = true, useOfflineCheckTimer = true) =>
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
        broker.broadcastLocal('$transporter.connected', { wasReconnect })

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
        broker.bus.emit('$transporter.disconnected')
      })
      .then(() => {
        stopTimers()
      })
  }

  const messageHandler = createMessageHandler(broker, transport, pending)

  adapter.init(broker, transport)
    .then(() => {
      adapter.bus.on('$adapter.connected', onConnect)
      adapter.bus.on('$adapter.disconnected', onDisconnect)
      adapter.bus.on('$adapter.message', messageHandler)
    })

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
      adapter.subscribe(MessageTypes.MESSAGE_EVENT, nodeId)
    ])
  }

  function startHeartbeatTimer () {
    heartbeatTimer = setInterval(() => sendHeartbeat(), broker.options.transport.heartbeatInterval)
    heartbeatTimer.unref()
  }

  function startRemoteNodeCheckTimer () {
    checkNodesTimer = setInterval(() => checkRemoteNodes(), broker.options.transport.heartbeatTimeout)
    checkNodesTimer.unref()
  }

  function startOfflineNodeCheckTimer () {
    checkOfflineNodesTimer = setInterval(() => checkOfflineNodes(), broker.options.transport.offlineNodeCheckInterval)
    checkOfflineNodesTimer.unref()
  }

  function startUpdateLocalNodeTimer () {
    updateLocalNodeTimer = setInterval(() => {
      const node = broker.registry.nodes.localNode
      node.updateLocalInfo(true)
    }, broker.options.transport.nodeUpdateInterval)

    updateLocalNodeTimer.unref()
  }

  function stopTimers () {
    clearInterval(heartbeatTimer)
    clearInterval(checkNodesTimer)
    clearInterval(checkOfflineNodes)
    clearInterval(updateLocalNodeTimer)
  }

  function sendHeartbeat () {
    const node = broker.registry.nodes.localNode
    node.updateLocalInfo()

    log.trace(`Send heartbeat from ${node.id}`)

    transport.send(transport.createMessage(MessageTypes.MESSAGE_HEARTBEAT, null, {
      cpu: node.cpu,
      cpuSequence: node.cpuSequence,
      sequence: node.sequence
    }))
  }

  function checkRemoteNodes () {
    const now = Date.now()
    broker.registry.nodes.list({ withServices: true }).forEach(node => {
      if (node.isLocal || !node.isAvailable) {
        return
      }

      if (now - (node.lastHeartbeatTime || 0) > broker.options.transport.heartbeatTimeout) {
        broker.registry.nodeDisconnected(node.id, true)
      }
    })
  }

  // Removes the node after a given time from the registry.
  function checkOfflineNodes () {
    const now = Date.now()
    broker.registry.nodes.list({}).forEach(node => {
      if (node.isLocal || node.isAvailable) {
        return
      }

      if ((now - node.offlineTime) > broker.options.transport.maxOfflineTime) {
        broker.registry.removeNode(node.id)
      }
    })
  }
}
