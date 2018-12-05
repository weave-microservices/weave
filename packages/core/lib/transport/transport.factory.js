/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const makeTransport = ({
    makeConnect,
    makeDisconnect,
    makeDiscoverNodes,
    makeEmit,
    makeGetNodeInfos,
    makeLocalRequestProxy,
    makeMessageHandlers,
    makeRemovePendingRequests,
    makeRequest,
    makeResponse,
    makeSend,
    makeSendBroadcastEvent,
    makeSendNodeInfo,
    makeSetReady,
    Message,
    MessageTypes
}) =>
    ({
        adapter,
        bus,
        call,
        codec,
        Context,
        Errors,
        getLogger,
        localEventEmitter,
        options,
        registry,
        state
    }) => {
        let heartbeatTimer
        let checkNodesTimer

        const nodeId = state.nodeId
        const log = getLogger('TRANSPORT')
        const pendingRequests = new Map()
        const pendingResponseStreams = new Map()
        const pendingRequestStreams = new Map()
        const transport = Object.create({
            isConnected: false,
            isReady: false
        })

        // const pendingRequests = new Map()

        const { removePendingRequestsById, removePendingRequestsByNodeId } = makeRemovePendingRequests({ log, pendingRequests })

        const stats = {
            packets: {
                sent: 0,
                received: 0,
                pendingRequests: pendingRequests.size,
                pendingResponseStreams: pendingResponseStreams.size,
                pendingRequestStreams: pendingRequestStreams.size
            }
        }

        // modules
        const send = makeSend({ adapter, stats, log })
        const sendBalancedEvent = makeEmit({ log, send, Message, MessageTypes })
        const sendBroadcastEvent = makeSendBroadcastEvent({ log, send, Message, MessageTypes })
        const sendNodeInfo = makeSendNodeInfo({ send, registry, Message, MessageTypes })
        const connect = makeConnect({ adapter, log })
        const disconnect = makeDisconnect({ adapter, send, Message, MessageTypes })
        const getNodeInfos = makeGetNodeInfos({ state, registry, process })
        const request = makeRequest({ send, log, pendingRequests, Message, MessageTypes })
        const response = makeResponse({ nodeId, send, pendingRequests, Message, MessageTypes, log })
        const { discoverNodes, discoverNode } = makeDiscoverNodes({ send, Message, MessageTypes })
        const localRequestProxy = makeLocalRequestProxy({ call, log, registry, Errors: null })
        const setReady = makeSetReady({ sendNodeInfo, transport })

        const {
            onDisconnect,
            onDiscovery,
            onEvent,
            onHeartbeat,
            onNodeInfos,
            onRequest,
            onResponse
        } = makeMessageHandlers({
            bus,
            Context,
            discoverNode,
            discoverNodes,
            Errors,
            localEventEmitter,
            localRequestProxy,
            log,
            pendingRequests,
            pendingRequestStreams,
            pendingResponseStreams,
            registry,
            response,
            sendNodeInfo,
            state
        })

        adapter.init({ state, log, nodeId, messageHandler, registry, Message, MessageTypes })
            .then(() => {
                adapter.on('adapter.connected', onConnect)
                adapter.on('adapter.disconnected', onDisconnect)
                adapter.on('adapter.message', messageHandler)
            })

        return {
            connect,
            disconnect,
            getNodeInfos,
            removePendingRequestsById,
            removePendingRequestsByNodeId,
            request,
            sendBalancedEvent,
            sendBroadcastEvent,
            sendNodeInfo,
            setReady
        }

        function onConnect (wasReconnect) {
            return Promise.resolve()
                .then(() => {
                    if (!wasReconnect) {
                        return makeSubscriptions()
                    }
                })
                .then(() => discoverNodes())
                .then(() => {
                    transport.isConnected = true
                    log.info(`'${adapter.name}' transport adapter connected`)
                    bus.emit('$transporter.connected', wasReconnect)
                })
                .then(startTimers())
        }

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

        function messageHandler (type, data) {
            if (data === null) {
                throw new Errors.WeaveError('Packet missing!')
            }

            const message = data
            const payload = message.payload

            if (!payload) {
                throw new Errors.WeaveError('Message payload missing!')
            }

            if (payload.sender === nodeId) {
                return
            }

            stats.packets.received = stats.packets.received + 1

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
        }

        function startTimers () {
            heartbeatTimer = setInterval(() => {
                sendHeartbeat()
            }, options.heartbeatInterval)
            heartbeatTimer.unref()

            checkNodesTimer = setInterval(() => {
                checkRemoteNodes()
            }, options.heartbeatTimeout)
            checkNodesTimer.unref()
        }

        function sendHeartbeat () {
            const node = registry.nodes.localNode
            node.updateLocalInfo()

            log.trace(`Send heartbeat from ${node.id}`)

            send(Message(MessageTypes.MESSAGE_HEARTBEAT, null, {
                cpu: node.cpu + 100,
                cpuSequence: node.cpuSequence,
                sequence: node.sequence
            }))
        }

        function checkRemoteNodes () {
            const now = Date.now()
            registry.nodes.list({ withServices: true }).forEach(node => {
                if (node.isLocal || !node.isAvailable) return
                if (now - (node.lastHeartbeatTime || 0) > options.heartbeatTimeout) {
                    disconnected(node.id, true)
                }
            })
        }
        // node disconnected
        function disconnected (nodeId, isUnexpected) {
            const node = registry.nodes.get(nodeId)
            if (node && node.isAvailable) {
                node.disconnected(isUnexpected)
                registry.unregisterServiceByNodeId(node.id)
                bus.emit('$node.disconnected', { node, isUnexpected })
                log.warn(`Node ${node.id} disconnected!`)
                removePendingRequestsByNodeId(node.id)
            }
        }
    }

module.exports = makeTransport
