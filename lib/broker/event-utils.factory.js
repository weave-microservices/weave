/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const makeEmitter = ({ state, registry, bus }) => {
    let transport

    function emit (eventName, payload, groups) {
        if (groups && !Array.isArray(groups)) {
            groups = [groups]
        }

        if (/^\$/.test(eventName)) {
            bus.emit(eventName, payload)
        }

        const endpoints = registry.events.getBalancedEndpoints(eventName, groups)
        const groupedEndpoints = {}

        endpoints.map(([endpoint, groupName]) => {
            if (endpoint) {
                if (endpoint.node.id === state.nodeId) {
                    // Local event. Call handler
                    endpoint.action.handler(payload, endpoint.node.id, eventName)
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
