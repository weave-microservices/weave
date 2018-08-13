/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const { omit } = require('fachwork')
const EndpointList = require('./endpoint-list')

const MakeActionCatalog = ({ state, registry }) => {
    const actions = new Map()

    return {
        add (node, service, action) {
            let endPointList = actions.get(action.name)
            if (!endPointList) {
                endPointList = EndpointList(state, action.name)
                actions.set(action.name, endPointList)
            }
            return endPointList.add(node, service, action)
        },
        get (actionName) {
            return actions.get(actionName)
        },
        removeByService (service) {
            actions.forEach(list => {
                list.removeByService(service)
            })
        },
        remove (actionName, node) {
            const endpoints = actions.get(actionName)
            if (endpoints) {
                endpoints.removeByNodeId(node.id)
            }
        },
        list ({ onlyLocals = false, skipInternals = false, withEndpoints = false }) {
            const result = []
            actions.forEach(action => {
                if (skipInternals && /^\$node/.test(action.name)) {
                    return
                }

                if (onlyLocals && !action.hasLocal()) {
                    return
                }

                const item = {
                    name: action.name,
                    hasAvailable: action.hasAvailable(),
                    hasLocal: action.hasLocal(),
                    count: action.count(),
                    params: action.params
                }

                if (item.count > 0) {
                    const endpoint = action.endpoints[0]
                    if (endpoint) {
                        item.action = omit(endpoint.action, ['handler', 'service'])
                    }
                }
                if (item.action == null || item.action.protected) {
                    return
                }

                if (withEndpoints) {
                    item.endpoints = action.endpoints.map(endpoint => {
                        return {
                            nodeId: endpoint.node.id,
                            state: endpoint.state
                        }
                    })
                }
                result.push(item)
            })

            return result
        }
    }
}

module.exports = MakeActionCatalog
