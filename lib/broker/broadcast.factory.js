const broadcastFactory = ({ state, registry, transport, broadcastLocal }) =>
    (eventName, payload, groups = null) => {
        if (transport) {
            if (!/^\$/.test(eventName)) {
                const endpoints = registry.events.getAllEndpoints(eventName, groups)
                if (endpoints) {
                    endpoints.map(endpoint => {
                        if (endpoint.node.id !== state.nodeId) {
                            if (transport) {
                                transport.sendBroadcastEvent(endpoint.node.id, eventName, payload)
                            }
                        }
                    })
                }
            }
        }
        return broadcastLocal(eventName, payload)
    }

module.exports = broadcastFactory
