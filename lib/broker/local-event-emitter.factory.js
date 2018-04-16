/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const localEventEmitterFactory = ({ registry }) =>
    (eventName, data, senderNodeId, groups, isBroadcast) => {
        registry.events.emitLocal(eventName, data, senderNodeId, groups, isBroadcast)
    }

module.exports = localEventEmitterFactory
