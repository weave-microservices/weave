/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const makeTransport = ({
    Errors,
    makeConnect,
    makeDisconnect,
    Message,
    MessageTypes,
    makeGetNodeInfos,
    makeRemovePendingRequests,
    makeMessageHandlers,
    makeSend,
    makeSendNodeInfo,
    makeRequest,
    makeEmit,
    makeSendBroadcastEvent,
    makeResponse,
    makeDiscoverNodes,
    makeLocalRequestProxy,
    makeSetReady
}) =>
    ({
        state,
        bus,
        getLogger,
        localEventEmitter,
        call,
        registry,
        options,
        transport,
        Context
    }) => {
        let heartbeatTimer
        let checkNodesTimer

        const nodeId = state.nodeId
        const log = getLogger('TRANSPORT')
        const pendingRequests = new Map()
        const pendingResponseStreams = new Map()
        const pendingRequestStreams = new Map()
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
        const connect = makeConnect({ transport, log })
        const disconnect = makeDisconnect({ transport })
        const getNodeInfos = makeGetNodeInfos({ state, registry, process })
        const send = makeSend({ adapter: transport, stats })
        const sendBalancedEvent = makeEmit({ log, send, Message, MessageTypes })
        const sendBroadcastEvent = makeSendBroadcastEvent({ log, send, Message, MessageTypes })
        const sendNodeInfo = makeSendNodeInfo({ send, registry, Message, MessageTypes })
        const request = makeRequest({ send, log, pendingRequests, Message, MessageTypes })
        const response = makeResponse({ nodeId, send, pendingRequests, Message, MessageTypes })
        const { discoverNodes, discoverNode } = makeDiscoverNodes({ send, Message, MessageTypes })
        const localRequestProxy = makeLocalRequestProxy({ call, log, registry, Errors: null })
        const setReady = makeSetReady({ sendNodeInfo })

        const {
            onDiscovery,
            onNodeInfos,
            onHeartbeat,
            onRequest,
            onResponse,
            onEvent,
            onDisconnect
        } = makeMessageHandlers({
            state,
            log,
            Errors,
            bus,
            localEventEmitter,
            sendNodeInfo,
            registry,
            Context,
            response,
            pendingRequests,
            pendingResponseStreams,
            pendingRequestStreams,
            discoverNodes,
            discoverNode,
            localRequestProxy
        })

        transport.init({ state, log, nodeId, messageHandler })
            .then(() => {
                transport.on('adapter.connected', onConnect)
                transport.on('adapter.disconnected', onDisconnect)
                transport.on('adapter.message', messageHandler)
            })

        return {
            connect,
            disconnect,
            getNodeInfos,
            removePendingRequestsById,
            request,
            sendBalancedEvent,
            sendBroadcastEvent,
            sendNodeInfo,
            setReady
        }

        function onConnect (wasReconnect) {
            return Promise.resolve()
                .then(() => discoverNodes())
                // .then(() => {
                //     return sendNodeInfo()
                // })
                .then(() => {
                    log.info('Connected')
                    bus.emit('$transporter.connected', wasReconnect)
                })
                .then(startTimers())
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
                cpu: node.cpu
            }))
        }

        function checkRemoteNodes () {
            const now = Date.now()
            registry.nodes.list({ withServices: true }).forEach(node => {
                if (node.local || !node.isAvailable) return
                if (now - (node.lastHeartbeatTime || 0) > options.heartbeatTimeout) {
                    disconnected(node.id, true)
                }
            })
        }
        // node disconnected
        function disconnected (nodeId, isUnexpected) {
            const node = registry.nodes.get(nodeId)
            if (node && node.isAvailable) {
                node.disconnect(isUnexpected)
                registry.unregisterServiceByNodeId(node.id)
                bus.emit('$node.disconnected', { node, isUnexpected })
                log.warn(`Node ${node.id} disconnected!`)
                removePendingRequestsByNodeId(node.id)
            }
        }
    }

module.exports = makeTransport
