/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const broadcastFactory = ({ state, log, registry, transport, broadcastLocal }) =>
    (eventName, payload, groups = null) => {
        if (transport) {
            if (!/^\$/.test(eventName)) {
                const endpoints = registry.events.getAllEndpointsUniqueNodes(eventName, groups)
                if (endpoints) {
                    endpoints.map(endpoint => {
                        if (endpoint.node.id !== state.nodeId) {
                            if (transport) {
                                transport.sendBroadcastEvent(endpoint.node.id, eventName, payload, groups)
                            }
                        }
                    })
                }
            }
        }
        return broadcastLocal(eventName, payload, groups)
    }

module.exports = broadcastFactory
