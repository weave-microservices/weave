/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const Node = require('./node')
const { getIpList } = require('../utils.js')
const omit = require('fachwork')

const MakeNodeCatalog = ({
    state,
    registry,
    log,
    bus
}) => {
    const nodes = new Map()

    const self = {
        localNode: null,
        createNode (nodeId) {
            return new Node(nodeId)
        },
        add (id, node) {
            nodes.set(id, node)
        },
        has (id) {
            return nodes.has(id)
        },
        get (id) {
            return nodes.get(id)
        },
        list ({ withServices = true }) {
            const result = []
            nodes.forEach(node => {
                if (withServices) {
                    result.push(node)
                } else {
                    result.push(omit(node, ['services']))
                }
            })
            return result
        },
        processNodeInfo (payload) {
            const nodeId = payload.sender
            let node = nodes.get(nodeId)
            let isNew = false
            let isReconnected = false

            // node doesn´t exist, so it is a new node.
            if (!node) {
                isNew = true
                node = new Node(nodeId)
                self.add(nodeId, node)
            } else if (!node.isAvailable) {
                isReconnected = true
                node.isAvailable = true
                node.lastHeartbeatTime = Date.now()
            }

            node.update(payload)

            if (node.services) {
                registry.registerServices(node, node.services)
            }

            if (isNew) {
                registry.emit('node.connected', { node, isReconnected })
                log.info(`Node ${node.id} connected!`)
            } else if (isReconnected) {
                registry.emit('node.connected', { node, isReconnected })
                log.info(`Node ${node.id} reconnected!`)
            } else {
                registry.emit('node.updated', { node, isReconnected })
                log.info(`Node ${node.id} updated!`)
            }
        },
        disconnected (nodeId, isUnexpected) {
            const node = nodes.get(nodeId)
            if (node && node.isAvailable) {
                registry.unregisterServiceByNodeId(node.id)
                node.disconnected(isUnexpected)
                registry.emit('node.disconnected', nodeId, isUnexpected)
                log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`)
            }
        },
        toArray () {
            const result = []
            nodes.forEach(node => result.push(node))
            return result
        }
    }

    addLocalNode()

    return self

    function addLocalNode () {
        const node = new Node(state.nodeId)

        node.isLocal = true
        node.IPList = getIpList()
        node.client = {
            type: 'nodejs',
            version: state.version,
            langVersion: process.version
        }

        self.add(node.id, node)
        self.localNode = node

        return node
    }
}

module.exports = MakeNodeCatalog
