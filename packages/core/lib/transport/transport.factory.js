/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

// own packages
const { WeaveError } = require('../errors')
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
            pendingRequests.delete(requestId)
        },
        removePendingRequestsByNodeId (nodeId) {
            log.debug('Remove pending requests.')
            pendingRequests.forEach((request, requestId) => {
                if (request.nodeId === nodeId) {
                    pendingRequests.delete(requestId)
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

    const messageHandler = createMessageHandler(broker, transport, broker.registry)
    // const messageHandler = (type, data) => {
    //     if (data === null) {
    //         throw new WeaveError('Packet missing!')
    //     }

    //     const message = data
    //     const payload = message.payload

    //     if (!payload) {
    //         throw new WeaveError('Message payload missing!')
    //     }

    //     if (payload.sender === nodeId) {
    //         return
    //     }

    //     stats.packets.received = stats.packets.received + 1

    //     switch (type) {
    //         case 'discovery':
    //             onDiscovery(payload)
    //             break
    //         case 'info':
    //             onNodeInfos(payload)
    //             break
    //         case 'request':
    //             onRequest(payload)
    //             break
    //         case 'response':
    //             onResponse(payload)
    //             break
    //         case 'disconnect':
    //             onDisconnect(payload)
    //             break
    //         case 'heartbeat':
    //             onHeartbeat(payload)
    //             break
    //         case 'event':
    //             onEvent(payload)
    //             break
    //     }
    // }

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
