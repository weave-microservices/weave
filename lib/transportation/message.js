
const makeMessage = (MessageTypes) =>
    (type, targetNodeId, payload) => {
        return {
            type: type || MessageTypes.MESSAGE_UNKNOWN,
            targetNodeId,
            payload: payload || {}
        }
    }

module.exports = makeMessage
