const makeTransport = ({
    makeConnect,
    makeDisconnect,
    Message,
    MessageTypes,
    makeGetNodeInfos,
    makeRemovePendingRequests,
    makeMessageHandlers,
    makeSend,
    makeSendHeartbeat,
    makeSendNodeInfo,
    makeRequest,
    makeEmit,
    makeSendBroadcastEvent,
    makeResponse,
    makeDiscoverNodes,
    makeRemoteRequestHandler
}) =>
    ({
        state,
        bus,
        getLogger,
        localEventEmitter,
        localCall,
        registry,
        options,
        transport,
        contextFactory
    }) => {
        let heartbeatTimer
        let checkNodesTimer

        const nodeId = state.nodeId
        const log = getLogger('TRANSPORT')
        const pendingRequests = new Map()
        const removePendingRequests = makeRemovePendingRequests({ pendingRequests })

        const stats = {
            packets: {
                sent: 0,
                received: 0,
                pendingRequests: pendingRequests.size
            }
        }

        // modules
        const connect = makeConnect({ transport, log })
        const disconnect = makeDisconnect({ transport })
        const getNodeInfos = makeGetNodeInfos({ state, registry, process })
        const send = makeSend({ adapter: transport, stats })
        const sendBalancedEvent = makeEmit({ log, send, Message, MessageTypes })
        const sendBroadcastEvent = makeSendBroadcastEvent({ log, send, Message, MessageTypes })

        // const sendHeartbeat = makeSendHeartbeat({ log, send, Message, MessageTypes })
        const sendNodeInfo = makeSendNodeInfo({ send, registry, Message, MessageTypes })

        const request = makeRequest({ send, log, pendingRequests, Message, MessageTypes })
        const response = makeResponse({ nodeId, send, pendingRequests, Message, MessageTypes })

        const { discoverNodes, discoverNode } = makeDiscoverNodes({ send, Message, MessageTypes })

        const remoteRequestHandler = makeRemoteRequestHandler({ localCall, log, registry, Errors: null })

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
            bus,
            localEventEmitter,
            sendNodeInfo,
            registry,
            contextFactory,
            response,
            pendingRequests,
            discoverNodes,
            discoverNode,
            remoteRequestHandler
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
            removePendingRequests,
            request,
            sendBalancedEvent,
            sendBroadcastEvent,
            sendNodeInfo
        }

        // self.serialize = (payload, type) => {
        //     return JSON.stringify({ type, payload })
        // }
        // self.deserialize = (data) => {
        //     try {
        //         return JSON.parse(data)
        //     } catch (error) {
        //         throw error
        //     }
        // }
        // self.discoverNode = discoverNode

        // return self

        function onConnect (wasReconnect) {
            return Promise.resolve()
                .then(() => discoverNodes())
                .then(() => sendNodeInfo())
                .then(() => {
                    log.info('Connected')
                    bus.emit('$transport.connected', wasReconnect)
                })
                .then(startTimers())
        }

        function messageHandler (type, data) {
            if (data === null) {
                throw new Error('Packet missing!')
            }

            const message = data
            const payload = message.payload

            if (!payload) {
                throw new Error('Message payload missing!')
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

        // function stopTimers () {
        //     clearInterval(heartbeatTimer)
        //     clearInterval(checkNodesTimer)
        // }

        function sendHeartbeat () {
            const node = registry.nodes.localNode

            registry.nodes.localNode.updateLocalInfo()
            log.debug(`Send heartbeat from ${node.id}`)

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
            }
        }
    }

module.exports = makeTransport
