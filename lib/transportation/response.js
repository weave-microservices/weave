module.exports = ({ nodeId, send, Message, MessageTypes }) => 
    (target, contextId, data, error) => {
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
        send(Message(MessageTypes.MESSAGE_RESPONSE, target, payload )) //.Response(self, target, contextId, data, error))
        //}
    }