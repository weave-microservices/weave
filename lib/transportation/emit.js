module.exports = ({ send, Message, MessageTypes }) =>
    (eventName, data, nodeGroups) => {
        Object.keys(nodeGroups)
            .map(nodeId => [nodeId, nodeGroups[nodeId]])
            .map(([nodeId, groups]) => {
                send(Message(MessageTypes.MESSAGE_EVENT, nodeId, {
                    eventName,
                    data,
                    groups,
                    isBroadcast: false
                }))
            })
    }
