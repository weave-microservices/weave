module.exports = ({ send, Message, MessageTypes }) => {
    return {
        discoverNode: (target) => send(Message(MessageTypes.MESSAGE_DISCOVERY, target)),
        discoverNodes: () => send(Message(MessageTypes.MESSAGE_DISCOVERY))
    }
}
