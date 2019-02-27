/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ send, Message, MessageTypes }) =>
    (eventName, data, nodeGroups) => {
        Object.keys(nodeGroups)
            .map(nodeId => [nodeId, nodeGroups[nodeId]])
            .map(([nodeId, groups]) => {
                send(Message(MessageTypes.MESSAGE_EVENT, nodeId, {
                    data,
                    eventName,
                    groups,
                    isBroadcast: false
                }))
            })
    }
