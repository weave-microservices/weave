/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const EndpointList = require('./endpoint-list')
const { match } = require('../utils.js')

const MakeEventCatalog = ({ state, registry }) => {
    const events = []

    const getAllEvents = () => events

    const getAllEventsByEventName = (eventName) => getAllEvents().filter(list => match(eventName, list.name))

    return {
        add (node, service, event) {
            const groupName = event.group || service.name
            let endpointList = this.get(event.name, groupName)
            if (!endpointList) {
                endpointList = EndpointList(state, registry, event.name, groupName)
                events.push(endpointList)
            }
            return endpointList.add(node, service, event)
        },
        get (eventName, groupName) {
            return events.find(endpointList => endpointList.name === eventName && endpointList.groupName === groupName)
        },
        // list ({ onlyLocals = false, skipInternals = false, withEndpoints = false }) {
        //     const result = []
        //     Object.keys(events).map(key => events[key]).forEach(eventEndpointList => {
        //         if (skipInternals && /^\$node/.test(eventEndpointList.name)) {
        //             return
        //         }

        //         if (onlyLocals && !eventEndpointList.hasLocal()) {
        //             return
        //         }

        //         const item = {
        //             name: eventEndpointList.name,
        //             hasAvailable: eventEndpointList.hasAvailable(),
        //             hasLocal: eventEndpointList.hasLocal(),
        //             count: eventEndpointList.count()
        //         }
        //         if (item.count > 0) {
        //             const endpoint = eventEndpointList.endpoints[0]
        //             if (endpoint) {
        //                 item.event = omit(endpoint.event, ['service', 'handler'])
        //             }
        //         }

        //         if (withEndpoints) {
        //             item.endpoints = eventEndpointList.endpoints.map(endpoint => {
        //                 return {
        //                     nodeId: endpoint.node.id,
        //                     state: endpoint.state
        //                 }
        //             })
        //         }
        //         result.push(item)
        //     })
        //     return result
        // },
        removeByService (service) {
            getAllEvents().map(list => list.removeByService(service))
        },
        getBalancedEndpoints (eventName, groups) {
            return getAllEventsByEventName(eventName)
                .filter(endpointList => (groups == null || groups.length === 0 || groups.includes(endpointList.groupName)))
                .map(endpointList => ({ endpoint: endpointList.getNextAvailable(), endpointList }))
                .filter(({ endpoint }) => endpoint && endpoint.isAvailable())
                .map(({ endpoint, endpointList }) => [endpoint, endpointList.groupName])
        },
        getAllEndpoints (eventName) {
            return getAllEventsByEventName(eventName)
                .map(list => list.endpoints)
                .map(endpoints => endpoints.filter(endpoint => endpoint.isAvailable()))
                .reduce((prev, curr) => prev.concat(curr))
        },
        getAllEndpointsUniqueNodes (eventName, groups) {
            let endpoints = getAllEventsByEventName(eventName)
                .filter(endpointList => (groups == null || groups.length === 0 || groups.includes(endpointList.groupName)))
                .map(endpointList => endpointList.endpoints)

            if (endpoints.length > 0) {
                endpoints = endpoints.reduce((prev, curr) => prev.concat(curr))
            }

            const unique = {}
            const distinct = []

            for (const i in endpoints) {
                if (typeof (unique[endpoints[i].node.id]) === 'undefined') {
                    distinct.push(endpoints[i])
                }
                unique[endpoints[i].node.id] = endpoints[i].node.id
            }

            return distinct
        },
        emitLocal (eventName, payload, sender, groups, isBroadcast) {
            getAllEventsByEventName(eventName)
                .filter(endpointList => (groups == null || groups.length === 0 || groups.includes(endpointList.groupName)))
                .map(list => {
                    if (isBroadcast) {
                        list.endpoints.map(endpoint => {
                            if (endpoint.local && endpoint.action.handler) {
                                endpoint.action.handler(payload, sender, eventName)
                            }
                        })
                    } else {
                        const endpoint = list.getNextLocalEndpoint()
                        if (endpoint && endpoint.local && endpoint.action.handler) {
                            endpoint.action.handler(payload, sender, eventName)
                        }
                    }
                })
        }
    }
}

module.exports = MakeEventCatalog
