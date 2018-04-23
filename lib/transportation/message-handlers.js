module.exports = ({ weave, bus, localEventEmitter, log, sendNodeInfo, registry, contextFactory, response, pendingRequests, discoverNodes, discoverNode, remoteRequestHandler }) => {
    return {
        onDiscovery (message) {
            sendNodeInfo(message.sender)
        },
        onNodeInfos (payload) {
            return registry.nodes.processNodeInfo(payload)
        },
        onRequest (payload) {
            const sender = payload.sender
            // bus.emit('$transport.request', payload)
            const context = contextFactory.createFromPayload(payload)
            remoteRequestHandler(context)
                .then(result => response(sender, payload.id, result, null))
                .catch(error => response(sender, payload.id, null, error))
            // weave.call(payload.action, payload.params, { context })
            //     .then(result => response(sender, payload.id, result, null))
            //     .catch(error => response(sender, payload.id, null, error))
        },
        onResponse (payload) {
            const id = payload.id
            const request = pendingRequests.get(id)

            if (!request) {
                return Promise.resolve()
            }

            pendingRequests.delete(payload.id)

            if (!payload.success) {
                const error = new Error(`${payload.error ? payload.error.message : 'Unknown error'} on NodeId: ${payload.sender}`)

                error.code = payload.error.code
                error.name = payload.error.name
                error.type = payload.error.type

                if (payload.error.stack) {
                    error.stack = payload.error.stack
                }
                request.reject(error)
            }
            request.resolve(payload.data)
        },
        onDisconnect (wasExpected) {
            bus.emit('$transport.disconnected', wasExpected)
        },
        onHeartbeat (payload) {
            // registry.nodes.heartbeat(payload)
            log.debug(`Heartbeat from ${payload.sender}`)
            const node = registry.nodes.get(payload.sender)
            // if node is unknown then request node info package.
            if (node) {
                if (!node.isAvailable) {
                    log.debug(`Known node. Propably reconnected.`)
                    // unknown node. request info
                    discoverNode(payload.sender)
                } else {
                    node.heartbeat(payload)
                }
            } else {
                // unknown node. request info
                discoverNode(payload.sender)
            }
        },
        onEvent (payload) {
            localEventEmitter(payload.eventName, payload.data, payload.sender, payload.groups, payload.isBroadcast)
        }
    }
}
