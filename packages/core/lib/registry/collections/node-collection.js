/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { getIpList } = require('../../utils.js')
const omit = require('fachwork')
const Node = require('../node')

const MakeNodeCollection = (registry) => {
    const broker = registry.broker
    const nodes = new Map()

    const nodeCollection = {
        localNode: null,
        createNode (nodeId) {
            return Node(nodeId)
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
        remove (id) {
            const node = nodes.get(id)
            if (node && node.isAvailable) {
                return false
            }
            return nodes.delete(id)
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
        // disconnected (nodeId, isUnexpected) {
        //     const node = nodes.get(nodeId)
        //     if (node && node.isAvailable) {
        //         registry.unregisterServiceByNodeId(node.id)
        //         node.disconnected(isUnexpected)
        //         registry.emit('node.disconnected', nodeId, isUnexpected)
        //         log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`)
        //     }
        // },
        toArray () {
            const result = []
            nodes.forEach(node => result.push(node))
            return result
        }
    }

    // get Local node informations and add it to the collection by
    const addLocalNode = () => {
        const node = Node(broker.nodeId)

        node.isLocal = true
        node.IPList = getIpList()
        node.client = {
            type: 'nodejs',
            version: broker.version,
            langVersion: process.version
        }

        node.sequence = 1
        nodeCollection.add(node.id, node)
        nodeCollection.localNode = node

        return node
    }

    addLocalNode()

    return nodeCollection
}

module.exports = MakeNodeCollection