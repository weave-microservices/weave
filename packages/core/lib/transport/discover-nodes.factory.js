/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ send, Message, MessageTypes }) => {
    return {
        discoverNode: (target) => send(Message(MessageTypes.MESSAGE_DISCOVERY, target)),
        discoverNodes: () => {
            return send(Message(MessageTypes.MESSAGE_DISCOVERY))
        }
    }
}
