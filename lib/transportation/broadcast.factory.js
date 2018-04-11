const broadcastFactory = ({ log, send, Message, MessageTypes }) =>
    (nodeId, eventName, data, groups) => {
        log.debug(`Send ${eventName} to ${nodeId}`)
        send(Message(MessageTypes.MESSAGE_EVENT, nodeId, {
            eventName,
            data,
            groups,
            isBroadcast: true
        }))
    }

module.exports = broadcastFactory
