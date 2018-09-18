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
                bus.emit('$node.connected', { node, isReconnected })
                log.info(`Node ${node.id} connected!`)
            } else if (isReconnected) {
                bus.emit('$node.connected', { node, isReconnected })
                log.info(`Node ${node.id} reconnected!`)
            } else {
                bus.emit('$node.updated', { node, isReconnected })
                log.info(`Node ${node.id} updated!`)
            }
        }
    }

    addLocalNode()

    return self

    function addLocalNode () {
        const node = new Node(state.nodeId)

        node.local = true
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
