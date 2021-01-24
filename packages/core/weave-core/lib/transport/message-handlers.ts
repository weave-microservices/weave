/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Broker } from "../broker/broker"
import { Transform } from 'stream'
import { WeaveError, restoreError } from '../errors'
import  { Context, createContext } from '../broker/context'
import MessageTypes from './message-types'
import { PendingStore, Transport } from "./transport-factory"

export type MessageHandlerResult = (type: string, data: any) => {}

export function createMessageHandler(broker: Broker, transport: Transport, pending: PendingStore) : MessageHandlerResult{
  const registry = broker.registry

  const localRequestProxy = (context: Context) => {
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

    // if ther is no endpoint, reject
    if (!endpoint) {
      transport.log.warn(`Service ${actionName} is not available localy.`)
      return Promise.reject('Service not found')
    }

    // Call the local action handler with context
    return endpoint.action.handler(context)
  }

  // Handle discovery request
  const onDiscovery = message => transport.sendNodeInfo(message.sender)

  // Handle node informations
  const onNodeInfos = payload => registry.processNodeInfo(payload)

  // Handle request
  const onRequest = (payload) => {
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
            stream.write(payload.data.type === 'Buffer' ? Buffer.from(payload.data.data) : payload.data)
            return
          }
        } else if (payload.isStream) {
          stream = new Transform({
            objectMode: payload.meta && payload.meta.$isObjectModeStream,
            transform: function (chunk, encoding, done) {
              this.push(chunk)
              return done()
            }
          })
          pending.requestStreams.set(id, stream)
        }
      }

      const endpoint = registry.getLocalActionEndpoint(payload.action)
      const context = createContext(broker)

      context.setEndpoint(endpoint)
      context.id = payload.id
      context.setData(stream || payload.data)
      context.parentId = payload.parentId
      context.requestId = payload.requestId
      context.meta = payload.meta || {}
      context.metrics = payload.metrics
      context.level = payload.level
      context.callerNodeId = payload.sender
      context.options.timeout = payload.timeout || broker.options.registry.requestTimeout || 0

      return localRequestProxy(context)
        .then(data => transport.response(sender, payload.id, data, context.meta, null))
        .catch(error => transport.response(sender, payload.id, null, context.meta, error))
    } catch (error) {
      return transport.response(sender, payload.id, null, payload.meta, error)
    }
  }

  // Handle response
  const onResponse = payload => {
    const id = payload.id
    const request = pending.requests.get(id)

    if (!request) {
      return Promise.resolve()
    }

    // Merge meta data from response
    Object.assign(request.context.meta, payload.meta)

    // Handle streams
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
          objectMode: payload.meta && payload.meta.$isObjectModeStream,
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

  // Pong handler
  const onPing = payload => {
    const message = transport.createMessage(MessageTypes.MESSAGE_PONG, payload.sender, {
      dispatchTime: payload.dispatchTime,
      arrivalTime: Date.now()
    })
    return transport.send(message)
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

  const onEvent = (payload) => {
    // todo: reconstruct event context
    const context = createContext(broker)

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

    return registry.events.emitLocal(context)
  }

  // Disconnected message handöer
  const onDisconnect = payload => {
    return registry.nodeDisconnected(payload.sender, false)
  }

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
        broker.handleError(new WeaveError('Packet missing!'))
      }

      const message = data
      const payload = message.payload

      if (!payload) {
        broker.handleError(new WeaveError('Message payload missing!'))
      }

      // todo: check protocol version
      // todo: check node ID conflict

      if (payload.sender === broker.nodeId) {
        // if (type === MessageTypes.MESSAGE_INFO) {
        //   return broker.fatalError('Broker has detected a node ID conflict. "nodeId" of broker needs to be unique. Broker will be stopped.')
        // }
      }

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
      }
      return true
    } catch (error) {
      transport.log.error(error, data)
    }
    return false
  }
}
