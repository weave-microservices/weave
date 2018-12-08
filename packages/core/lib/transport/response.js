/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ nodeId, send, Message, MessageTypes, log }) =>
    (target, contextId, data, error) => {
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
            log.debug('Send new stream chunk to ', target)

            stream.on('data', chunk => {
                const payloadCopy = Object.assign({}, payload)
                payloadCopy.data = chunk
                log.debug('Send Stream chunk to ', target)
                stream.pause()
                return send(Message(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy))
                    .then(() => stream.resume())
            })

            stream.on('end', () => {
                const payloadCopy = Object.assign({}, payload)
                payloadCopy.data = null
                payloadCopy.isStream = false
                log.debug('Send end stream chunk to ', target)
                send(Message(MessageTypes.MESSAGE_RESPONSE, target, payloadCopy))
            })

            stream.on('error', () => {
                send(Message(MessageTypes.MESSAGE_RESPONSE, target, payload))
            })

            payload.data = null

            return send(Message(MessageTypes.MESSAGE_RESPONSE, target, payload))
                .then(() => stream.resume())
        }

        return send(Message(MessageTypes.MESSAGE_RESPONSE, target, payload))
    }
