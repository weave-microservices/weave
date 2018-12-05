/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const connectFactory = ({ adapter, send, Message, MessageTypes }) =>
    () => {
        return send(Message(MessageTypes.MESSAGE_DISCONNECT))
            .then(() => adapter.close())
    }

module.exports = connectFactory
