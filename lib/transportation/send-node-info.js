module.exports = ({ send, registry, Message, MessageTypes }) =>
    (sender) => {
        const info = registry.getLocalNodeInfo()
        send(Message(MessageTypes.MESSAGE_INFO, sender, info))
    }