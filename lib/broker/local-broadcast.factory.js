const broadcastLocalFactory = ({ state, registry }) =>
    (eventName, payload, groups = null) => {
        if (groups && !Array.isArray(groups)) {
            groups = [groups]
        }
        registry.events.emitLocal(eventName, payload, state.nodeId, groups, true)
    }

module.exports = broadcastLocalFactory
