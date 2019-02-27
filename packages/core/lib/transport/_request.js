/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const requestFactory = ({
    Errors,
    log,
    Message,
    MessageTypes,
    options,
    pendingRequests,
    send
}) =>
    (context) => {
        function doRequest (context, resolve, reject) {
            const isStream = context.params && context.params.readable === true && typeof context.params.on === 'function' && typeof context.params.pipe === 'function'

            const request = {
                targetNodeId: context.nodeId,
                action: context.action.name,
                resolve,
                reject,
                isStream
            }

            log.debug(`Send Request for ${request.action} to node ${request.targetNodeId}.`)

            pendingRequests.set(context.id, request)

            const payload = {
                id: context.id,
                action: context.action.name,
                params: isStream ? null : context.params,
                meta: context.meta,
                timeout: context.timeout,
                level: context.level,
                metrics: context.metrics,
                requestId: context.requestId,
                parentId: context.parentId,
                isStream
            }

            const message = Message(MessageTypes.MESSAGE_REQUEST, context.nodeId, payload)

            send(message)
                .then(() => {
                    if (isStream) {
                        const stream = context.params
                        payload.meta = {}

                        stream.on('data', chunk => {
                            const payloadCopy = Object.assign({}, payload)
                            payloadCopy.params = chunk
                            stream.pause()
                            return send(Message(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy))
                                .then(() => stream.resume())
                        })

                        stream.on('end', () => {
                            const payloadCopy = Object.assign({}, payload)
                            payloadCopy.params = null
                            payloadCopy.isStream = false
                            return send(Message(MessageTypes.MESSAGE_REQUEST, context.nodeId, payloadCopy))
                        })

                        stream.on('error', (bhunk) => {
                            return send(Message(MessageTypes.MESSAGE_REQUEST, context.nodeId, payload))
                        })
                    }
                })
        }

        // If queue size is set, check queue size and reject the request.
        if (options.maxQueueSize && options.maxQueueSize < pendingRequests.size) {
            return Promise.reject(new Errors.WeaveQueueSizeExceededError({
                action: context.action.name,
                limit: options.maxQueueSize,
                nodeId: context.nodeId,
                size: pendingRequests.size
            }))
        }

        return new Promise((resolve, reject) => doRequest(context, resolve, reject))
    }

module.exports = requestFactory
