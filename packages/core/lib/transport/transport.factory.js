/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

// own packages
const { WeaveError, WeaveQueueSizeExceededError } = require('../errors')
const MessageTypes = require('./message-types')
const utils = require('../utils')
const createMessageHandler = require('./message-handlers')

/**
 * Create a Transport adapter
 * @param {BrokerInstance} broker Borker instance
 * @param {Object} adapter Adapter wrapper
 * @returns {Transport} transport
 */
const createTransport = (broker, adapter) => {
    let heartbeatTimer
    let checkNodesTimer
    let checkOfflineNodesTimer

    const nodeId = broker.nodeId
    const log = broker.createLogger('TRANSPORT')
    const pending = {
        requests: new Map(),
        requestStreams: new Map(),
        responseStreams: new Map()
    }
    const pendingRequests = new Map()
    const pendingResponseStreams = new Map()
    const pendingRequestStreams = new Map()

    // const transport = Object.create({
    //     isConnected: false,
    //     isReady: false,
    //     resolveConnect: null
    // })

    // const { removePendingRequestsById, removePendingRequestsByNodeId } = makeRemovePendingRequests({ log, pendingRequests })

    const stats = {
        packets: {
            sent: 0,
            received: 0,
            pendingRequests: pendingRequests.size,
            pendingResponseStreams: pendingResponseStreams.size,
            pendingRequestStreams: pendingRequestStreams.size
        }
    }

    const transport = {
        log: broker.createLogger('TRANSPORT'),
        isConnected: false,
        isReady: false,
        resolveConnect: null,
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
                    return adapter.connect(isTryReconnect, errorHandler)
                        .catch(errorHandler)
                }
                doConnect(false)
            })
        },
        disconnect () {
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
            stats.packets.sent = stats.packets.sent + 1
            log.debug(`Send ${message.type.toUpperCase()} packet to ${message.targetNodeId || 'all nodes'}`)
            return adapter.preSend(message)
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
        removePendingRequestsById (requestId) {
            pending.requests.delete(requestId)
        },
        removePendingRequestsByNodeId (nodeId) {
            log.debug('Remove pending requests.')
            pending.requests.forEach((request, requestId) => {
                if (request.nodeId === nodeId) {
                    pending.requests.delete(requestId)
                }
                request.reject(new WeaveError(`Remove pending requests for node ${nodeId}.`))
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
            const doRequest = (context, resolve, reject) => {
                const isStream = context.params && context.params.readable === true && typeof context.params.on === 'function' && typeof context.params.pipe === 'function'

                const request = {
                    targetNodeId: context.nodeId,
                    action: context.action.name,
                    resolve,
                    reject,
                    isStream
                }

                log.debug(`Send Request for ${request.action} to node ${request.targetNodeId}.`)

                pending.requests.set(context.id, request)

                const payload = {
                    id: context.id,
                    action: context.action.name,
                    params: isStream ? null : context.params,
                    options: context.options,
                    meta: context.meta,
                    level: context.level,
                    metrics: context.metrics,
                    requestId: context.requestId,
                    parentId: context.parentId,
                    isStream
                }

                const message = this.createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payload)

                this.send(message)
                    .then(() => {
                        if (isStream) {
                            const stream = context.params
                            payload.meta = {}

                            stream.on('data', chunk => {
                                const payloadCopy = Object.assign({}, payload)
                                payloadCopy.params = chunk
                                stream.pause()
                                return this.send(this.createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy))
                                    .then(() => stream.resume())
                            })

                            stream.on('end', () => {
                                const payloadCopy = Object.assign({}, payload)
                                payloadCopy.params = null
                                payloadCopy.isStream = false
                                return this.send(this.createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy))
                            })

                            stream.on('error', (bhunk) => {
                                return this.send(this.createMessage(MessageTypes.MESSAGE_REQUEST, context.nodeId, payload))
                            })
                        }
                    })
            }

            // If the queue size is set, check the queue size and reject the job when the limit is reached.
            if (broker.options.maxQueueSize && broker.options.maxQueueSize < pendingRequests.size) {
                return Promise.reject(new WeaveQueueSizeExceededError({
                    action: context.action.name,
                    limit: broker.options.maxQueueSize,
                    nodeId: context.nodeId,
                    size: pendingRequests.size
                }))
            }

            return new Promise((resolve, reject) => doRequest(context, resolve, reject))
        },
        response (target, contextId, data, error) {
            // Check if data is a stream
            const isStream = data && data.readable === true && typeof data.on === 'function' && typeof data.pipe === 'function'
            const payload = {
                id: contextId,
                meta: {},
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

                payload.isStream = true
                stream.pause()
                this.log.debug('Send new stream chunk to ', target)

                stream.on('data', chunk => {
                    const payloadCopy = Object.assign({}, payload)
                    payloadCopy.data = chunk
                    this.log.debug('Send Stream chunk to ', target)
                    stream.pause()
                    return this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy))
                        .then(() => stream.resume())
                })

                stream.on('end', () => {
                    const payloadCopy = Object.assign({}, payload)
                    payloadCopy.data = null
                    payloadCopy.isStream = false
                    this.log.debug('Send end stream chunk to ', target)
                    this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy))
                })

                stream.on('error', () => {
                    this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payload))
                })

                payload.data = null

                return this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payload))
                    .then(() => stream.resume())
            }

            return this.send(this.createMessage(MessageTypes.MESSAGE_RESPONSE, target, payload))
        }
    }

    // const discoverNode = target => transport.send(transport.createMessage(MessageTypes.MESSAGE_DISCOVERY, target))
    // const discoverNodes = () => transport.send(transport.createMessage(MessageTypes.MESSAGE_DISCOVERY))

    const onConnect = (wasReconnect, startHeartbeatTimers = true) =>
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
                broker.bus.emit('$transporter.connected', wasReconnect)

                if (transport.resolveConnect) {
                    transport.resolveConnect()
                    transport.resolveConnect = null
                }
            })
            .then(() => {
                if (startHeartbeatTimers) {
                    startTimers()
                }
            })
            // .then(() => checkOfflineNodes())

    const messageHandler = createMessageHandler(broker, transport, pending)

    adapter.init(broker, transport)
        .then(() => {
            adapter.bus.on('$adapter.connected', onConnect)
            // adapter.on('$adapter.disconnected', onDisconnect)
            adapter.bus.on('$adapter.message', messageHandler)
        })

    return transport

    // const send = makeSend({ adapter, stats, log })
    // const sendBalancedEvent = makeEmit({ log, send, Message, MessageTypes })
    // const sendBroadcastEvent = makeSendBroadcastEvent({ log, send, Message, MessageTypes })
    // const sendNodeInfo = makeSendNodeInfo({ send, registry, Message, MessageTypes, transport })
    // const connect = makeConnect({ adapter, log, transport })
    // const disconnect = makeDisconnect({ adapter, send, Message, MessageTypes })
    // const getNodeInfos = makeGetNodeInfos({ state, registry, process })
    // const request = makeRequest({ options, Errors, send, log, pendingRequests, Message, MessageTypes })
    // const response = makeResponse({ nodeId, send, pendingRequests, Message, MessageTypes, log })
    // // const { discoverNodes, discoverNode } = makeDiscoverNodes({ send, Message, MessageTypes })
    // const localRequestProxy = makeLocalRequestProxy({ call, log, registry, Errors: null })
    // const setReady = makeSetReady({ state, sendNodeInfo, transport })

    // const {
    //     onDisconnect,
    //     onDiscovery,
    //     onEvent,
    //     onHeartbeat,
    //     onNodeInfos,
    //     onRequest,
    //     onResponse
    // } = makeMessageHandlers({
    //     bus,
    //     Context,
    //     discoverNode,
    //     discoverNodes,
    //     Errors,
    //     localEventEmitter,
    //     localRequestProxy,
    //     log,
    //     pendingRequests,
    //     pendingRequestStreams,
    //     pendingResponseStreams,
    //     registry,
    //     response,
    //     sendNodeInfo,
    //     state
    // })

    // adapter.init({ state, log, nodeId, messageHandler, registry, Message, MessageTypes })
    //     .then(() => {
    //         adapter.on('adapter.connected', onConnect)
    //         // adapter.on('adapter.disconnected', onDisconnect)
    //         adapter.on('adapter.message', messageHandler)
    //     })

    // return {
    //     connect,
    //     disconnect,
    //     getNodeInfos,
    //     removePendingRequestsById,
    //     removePendingRequestsByNodeId,
    //     request,
    //     sendBalancedEvent,
    //     sendBroadcastEvent,
    //     sendNodeInfo,
    //     setReady,
    //     pendingRequests
    // }

    // function onConnect (wasReconnect, startHeartbeatTimers = true) {
    //     return Promise.resolve()
    //         .then(() => {
    //             if (!wasReconnect) {
    //                 return makeSubscriptions()
    //             }
    //         })
    //         .then(() => discoverNodes())
    //         .then(() => utils.promiseDelay(Promise.resolve(), 500))
    //         .then(() => {
    //             transport.isConnected = true
    //             bus.emit('$transporter.connected', wasReconnect)

    //             if (transport.resolveConnect) {
    //                 transport.resolveConnect()
    //                 transport.resolveConnect = null
    //             }
    //         })
    //         .then(() => {
    //             if (startHeartbeatTimers) {
    //                 startTimers()
    //             }
    //         })
    //         // .then(() => checkOfflineNodes())
    // }

    function makeSubscriptions () {
        return Promise.all([
            adapter.subscribe(MessageTypes.MESSAGE_DISCOVERY),
            adapter.subscribe(MessageTypes.MESSAGE_DISCOVERY, nodeId),
            adapter.subscribe(MessageTypes.MESSAGE_INFO),
            adapter.subscribe(MessageTypes.MESSAGE_INFO, nodeId),
            adapter.subscribe(MessageTypes.MESSAGE_REQUEST, nodeId),
            adapter.subscribe(MessageTypes.MESSAGE_RESPONSE, nodeId),
            adapter.subscribe(MessageTypes.MESSAGE_DISCONNECT),
            adapter.subscribe(MessageTypes.MESSAGE_HEARTBEAT),
            adapter.subscribe(MessageTypes.MESSAGE_EVENT, nodeId)
        ])
    }

    function startTimers () {
        heartbeatTimer = setInterval(() => {
            sendHeartbeat()
        }, broker.options.heartbeatInterval)
        heartbeatTimer.unref()

        checkNodesTimer = setInterval(() => {
            checkRemoteNodes()
        }, broker.options.heartbeatTimeout)
        checkNodesTimer.unref()

        checkOfflineNodesTimer = setInterval(() => {
            checkOfflineNodes()
        }, broker.options.offlineNoteCheckInterval)
        checkOfflineNodesTimer.unref()
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
            if (node.isLocal || !node.isAvailable) return
            if (now - (node.lastHeartbeatTime || 0) > broker.options.heartbeatTimeout) {
                broker.registry.nodeDisconnected(node.id, true)
            }
        })
    }

    function checkOfflineNodes () {
        const now = Date.now()
        broker.registry.nodes.list({}).forEach(node => {
            if (node.isLocal || node.isAvailable) return

            if ((now - node.offlineTime) > 10 * 60 * 1000) {
                broker.registry.nodes.remove(node.id)
            }
        })
    }
}

module.exports = createTransport
