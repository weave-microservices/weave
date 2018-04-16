/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const makeEmitter = ({ state, registry }) => {
    let transport

    function emit (eventName, payload, groups) {
        if (groups && !Array.isArray(groups)) {
            groups = [groups]
        }

        if (/^\$/.test(eventName)) {
            // local event
        }

        const endpoints = registry.events.getBalancedEndpoints(eventName, groups)
        const groupedEndpoints = {}

        endpoints.map(([endpoint, groupName]) => {
            if (endpoint) {
                if (endpoint.node.id === state.nodeId) {
                    // Local event. Call handler
                    endpoint.action.handler(payload, endpoint.node.id)
                } else {
                    const e = groupedEndpoints[endpoint.node.id]
                    if (e) {
                        e.push(groupName)
                    } else {
                        groupedEndpoints[endpoint.node.id] = [groupName]
                    }
                }
            }
        })

        if (transport) {
            transport.sendBalancedEvent(eventName, payload, groupedEndpoints)
        }
    }

    return {
        setEventTransport (tp) {
            transport = tp
        },
        emit
    }
}

module.exports = makeEmitter
