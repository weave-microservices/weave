/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const connectFactory = ({ transport, send, Message, MessageTypes }) =>
    () => {
        return send(Message(MessageTypes.MESSAGE_DISCONNECT))
            .then(() => transport.close())
    }

module.exports = connectFactory
