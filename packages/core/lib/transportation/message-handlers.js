/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { Transform } = require('stream')

module.exports = ({
    state,
    bus,
    localEventEmitter,
    log,
    sendNodeInfo,
    registry,
    contextFactory,
    response,
    pendingRequests,
    pendingResponseStreams,
    pendingRequestStreams,
    discoverNodes,
    discoverNode,
    localRequestProxy,
    Context,
    Errors
}) => {
    return {
        onDiscovery (message) {
            sendNodeInfo(message.sender)
        },
        onNodeInfos (payload) {
            return registry.nodes.processNodeInfo(payload)
        },
        onRequest (payload) {
            const id = payload.id
            const sender = payload.sender
            try {
                let stream
                if (payload.isStream !== undefined) {
                    // check for open stream.
                    stream = pendingRequestStreams.get(id)
                    if (stream) {
                        // stream found
                        if (!payload.isStream) {
                            stream.end()
                            pendingRequests.delete(payload.id)
                            pendingRequestStreams.delete(payload.id)
                            return
                        } else {
                            log.debug('Stream chunk received from ', payload.sender)
                            stream.write(payload.params.type === 'Buffer' ? new Buffer(payload.params.data) : payload.params)
                            return
                        }
                    } else if (payload.isStream) {
                        stream = new Transform({
                            transform: function (chunk, encoding, done) {
                                this.push(chunk)
                                return done()
                            }
                        })
                        pendingRequestStreams.set(id, stream)
                    }
                }
                const endpoint = registry.getLocalActionEndpoint(payload.action)
                const context = Context(endpoint) // contextFactory.create(payload.action, state.nodeId,)

                context.id = payload.id
                context.setParams(stream || payload.params)
                context.parentId = payload.parentId
                context.requestId = payload.requestId
                context.timeout = payload.timeout || 0
                context.meta = payload.meta
                context.metrics = payload.metrics
                context.level = payload.level
                context.callerNodeId = payload.sender

                return localRequestProxy(context)
                    .then(result => response(sender, payload.id, result, null))
                    .catch(error => response(sender, payload.id, null, error))
            } catch (error) {
                return response(sender, payload.id, null, error)
            }
        },
        onResponse (payload) {
            const id = payload.id
            const request = pendingRequests.get(id)

            if (!request) {
                return Promise.resolve()
            }

            if (payload.isStream != null) {
                let stream = pendingResponseStreams.get(id)
                if (stream) {
                    if (!payload.isStream) {
                        log.info('Stream closing received from ', payload.sender)
                        stream.end()
                        pendingRequests.delete(payload.id)
                        pendingResponseStreams.delete(payload.id)
                    } else {
                        log.debug('Stream chunk received from ', payload.sender)
                        // console.log(payload.data)
                        stream.write(payload.data.type === 'Buffer' ? new Buffer.from(payload.data) : payload.data)
                    }
                    return request.resolve(payload.data)
                } else {
                    stream = new Transform({
                        transform: function (chunk, encoding, done) {
                            this.push(chunk)
                            return done()
                        }
                    })
                    log.debug('New stream received from ', payload.sender)

                    pendingResponseStreams.set(id, stream)
                    return request.resolve(stream)
                }
            }

            // pendingRequests.delete(payload.id)
            // pendingResponseStreams.delete(payload.id)

            if (!payload.success) {
                const error = new Errors.WeaveError(`${payload.error ? payload.error.message : 'Unknown error'} on node: '${payload.sender}'`)

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
        onDisconnect (payload) {
            registry.nodeDisconnected(payload)
        },
        onHeartbeat (payload) {
            // registry.nodes.heartbeat(payload)
            log.trace(`Heartbeat from ${payload.sender}`)
            const node = registry.nodes.get(payload.sender)
            // if node is unknown then request a node info package.
            if (node) {
                if (!node.isAvailable) {
                    log.debug(`Known node. Propably reconnected.`)
                    // unknown node. request info package.
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
