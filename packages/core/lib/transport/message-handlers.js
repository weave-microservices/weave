/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { Transform } = require('stream')
const { WeaveError, restoreError } = require('../errors')
const Context = require('../broker/context')
const MessageTypes = require('./message-types')

module.exports = (broker, transport, pending) => {
  const registry = broker.registry

  const localRequestProxy = context => {
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

    if (!endpoint) {
      transport.log.warn(`Service ${actionName} is not available localy.`)
      return Promise.reject('Service not found')
    }

    // Call the local action handler with context
    const p = endpoint.action.handler(context)
    return p
  }

  const onDiscovery = message => {
    return transport.sendNodeInfo(message.sender)
  }

  const onNodeInfos = payload => registry.processNodeInfo(payload)

  const onRequest = payload => {
    const id = payload.id
    const sender = payload.sender
    try {
      let stream
      if (payload.isStream !== undefined) {
        // check for open stream.
        stream = pending.requestStreams.get(id)
        if (stream) {
          // stream found
          if (!payload.isStream) {
            stream.end()
            pending.requests.delete(payload.id)
            pending.requestStreams.delete(payload.id)
            transport.log.debug('Stream closing received from ', payload.sender)
            return
          } else {
            transport.log.debug('Stream chunk received from ', payload.sender)
            stream.write(payload.params.type === 'Buffer' ? Buffer.from(payload.params.data) : payload.params)
            return
          }
        } else if (payload.isStream) {
          stream = new Transform({
            transform: function (chunk, encoding, done) {
              this.push(chunk)
              return done()
            }
          })
          pending.requestStreams.set(id, stream)
        }
      }
      const endpoint = registry.getLocalActionEndpoint(payload.action)
      const context = Context(broker, endpoint)

      context.id = payload.id
      context.setParams(stream || payload.params)
      context.parentId = payload.parentId
      context.requestId = payload.requestId
      context.meta = payload.meta
      context.metrics = payload.metrics
      context.level = payload.level
      context.callerNodeId = payload.sender
      context.options.timeout = payload.options.timeout || broker.options.requestTimeout || 0

      return localRequestProxy(context)
        .then(data => transport.response(sender, payload.id, data, context.meta, null))
        .catch(error => transport.response(sender, payload.id, null, context.meta, error))
    } catch (error) {
      return transport.response(sender, payload.id, null, payload.meta, error)
    }
  }

  const onResponse = payload => {
    const id = payload.id
    const request = pending.requests.get(id)

    if (!request) {
      return Promise.resolve()
    }

    // Merge meta data from response
    Object.assign(request.context.meta, payload.meta)

    if (payload.isStream != null) {
      let stream = pending.responseStreams.get(id)
      if (stream) {
        if (!payload.isStream) {
          transport.log.debug('Stream closing received from ', payload.sender)
          stream.end()
          pending.requests.delete(payload.id)
          pending.responseStreams.delete(payload.id)
        } else {
          transport.log.debug('Stream chunk received from ', payload.sender)
          stream.write(payload.data.type === 'Buffer' ? Buffer.from(payload.data) : payload.data)
        }
        return request.resolve(payload.data)
      } else {
        stream = new Transform({
          transform: function (chunk, encoding, done) {
            this.push(chunk)
            return done()
          }
        })
        transport.log.debug('New stream received from ', payload.sender)

        pending.responseStreams.set(id, stream)
        return request.resolve(stream)
      }
    }

    pending.requests.delete(payload.id)

    if (!payload.success) {
      let error = restoreError(payload.error) // new WeaveError(`${payload.error ? payload.error.message : 'Unknown error'} on node: '${payload.sender}'`)

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

  const onPing = payload => {
    return transport.send(transport.createMessage(MessageTypes.MESSAGE_PONG, payload.sender, {
      dispatchTime: payload.dispatchTime,
      arrivalTime: Date.now()
    }))
  }

  // Pong received.
  const onPong = payload => {
    const now = Date.now()
    const elapsedTime = now - payload.dispatchTime
    const timeDiff = Math.round(now - payload.arrivalTime - elapsedTime / 2)

    broker.broadcastLocal('$node.pong', {
      nodeId: payload.sender,
      elapsedTime,
      timeDiff
    })
  }

  const onEvent = payload => {
    registry.events.emitLocal(payload.eventName, payload.data, payload.sender, payload.groups, payload.isBroadcast)
    // localEventEmitter(payload.eventName, payload.data, payload.sender, payload.groups, payload.isBroadcast)
  }

  const onDisconnect = payload => registry.nodeDisconnected(payload.sender, false)

  const onHeartbeat = payload => {
    // registry.nodes.heartbeat(payload)
    transport.log.trace(`Heartbeat from ${payload.sender}`)
    const node = registry.nodes.get(payload.sender)
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

  return (type, data) => {
    try {
      if (data === null) {
        throw new WeaveError('Packet missing!')
      }

      const message = data
      const payload = message.payload

      if (!payload) {
        throw new WeaveError('Message payload missing!')
      }

      if (payload.sender === broker.nodeId) {
        return
      }

      // stats.packets.received = stats.packets.received + 1

      switch (type) {
      case 'discovery':
        onDiscovery(payload)
        break
      case 'info':
        onNodeInfos(payload)
        break
      case 'request':
        onRequest(payload)
        break
      case 'response':
        onResponse(payload)
        break
      case 'ping':
        onPing(payload)
        break
      case 'pong':
        onPong(payload)
        break
      case 'disconnect':
        onDisconnect(payload)
        break
      case 'heartbeat':
        onHeartbeat(payload)
        break
      case 'event':
        onEvent(payload)
        break
      }
    } catch (error) {
      transport.log.error(error, data)
    }
  }
}
