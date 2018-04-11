const localEventEmitterFactory = ({ registry }) =>
    (eventName, data, senderNodeId, groups, isBroadcast) => {
        registry.events.emitLocal(eventName, data, senderNodeId, groups, isBroadcast)
    }

module.exports = localEventEmitterFactory
