/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const { getIpList } = require('@weave-js/utils')
const { omit } = require('@weave-js/utils')
const { createNode } = require('../node')

exports.createNodeCollection = (registry) => {
  const broker = registry.broker
  const nodes = new Map()

  const nodeCollection = {
    localNode: null,
    createNode (nodeId) {
      return createNode(nodeId)
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
      return nodes.delete(id)
    },
    list ({ withServices = true }) {
      const result = []
      nodes.forEach(node => {
        if (withServices) {
          result.push(omit(node, ['info']))
        } else {
          result.push(omit(node, ['info', 'services']))
        }
      })
      return result
    },
    disconnected (nodeId, isUnexpected) {
      const node = nodes.get(nodeId)
      if (node && node.isAvailable) {
        registry.deregisterServiceByNodeId(node.id)
        node.disconnected(isUnexpected)
        broker.broadcastLocal('$node.disconnected', nodeId, isUnexpected)
        registry.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`)
      }
    },
    toArray () {
      const result = []
      nodes.forEach(node => result.push(node))
      return result
    }
  }

  // get Local node informations and add it to the collection by
  const addLocalNode = () => {
    const node = createNode(broker.nodeId)

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
