const requestFactory = ({ log, send, pendingRequests, Message, MessageTypes }) =>
    (context) => {
        function doRequest (context, resolve, reject) {
            const request = {
                id: context.id,
                targetNodeId: context.nodeId,
                action: context.action.name,
                resolve,
                reject
            }

            log.debug(`Send Request for ${request.action} to node ${request.targetNodeId}.`)

            pendingRequests.set(context.id, request)

            const message = Message(MessageTypes.MESSAGE_REQUEST, context.nodeId, {
                id: context.id,
                action: context.action.name,
                params: context.params,
                meta: context.meta,
                timeout: context.timeout,
                level: context.level,
                metrics: context.metrics,
                requestId: context.requestId,
                parentId: context.parentId
            })
            send(message)
        }
        return new Promise((resolve, reject) => doRequest(context, resolve, reject))
    }

module.exports = requestFactory
