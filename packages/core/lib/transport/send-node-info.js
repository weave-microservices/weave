/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ send, registry, Message, MessageTypes, transport }) =>
    (sender) => {
        if (!transport.isConnected || !transport.isReady) {
            return Promise.resolve()
        }

        const info = registry.getLocalNodeInfo()
        return send(Message(MessageTypes.MESSAGE_INFO, sender, info))
    }
