/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { getIpList, omit } from '@weave-js/utils'
import { createNode } from '../node'

export type NodeCollectionListFilterParams = {
  withServices?: boolean
}

export interface NodeCollection {
  localNode?: Node,
  hostname?: string,
  createNode(nodeId: string): Node,
  add(nodeId: string, node: Node): void,
  has(nodeId: string): boolean,
  get(nodeId: string): Node,
  remove(nodeId: string): boolean,
  list(filterParams: NodeCollectionListFilterParams): Array<Node>,
  disconnected(nodeId: string, isUnexpected: boolean): void,
  toArray(): Array<Node>
}

export function createNodeCollection(registry: Registry): NodeCollection {
  const nodeCollection: NodeCollection = Object.create(null)
  const broker = registry.broker
  const nodes = new Map<string, Node>()

  nodeCollection.localNode = null;

  nodeCollection.createNode = (nodeId): Node => {
    return createNode(nodeId)
  }

  nodeCollection.add = (id, node) => {
    nodes.set(id, node)
  }

  nodeCollection.has = (id) => {
    return nodes.has(id)
  }

  nodeCollection.get = (id) => {
    return nodes.get(id)
  }

  nodeCollection.remove = (id) => {
    return nodes.delete(id)
  }

  nodeCollection.list = ({ withServices = true }: NodeCollectionListFilterParams = {}) => {
    const result = []
    nodes.forEach(node => {
      if (withServices) {
        result.push(omit(node, ['info']))
      } else {
        result.push(omit(node, ['info', 'services']))
      }
    })
    return result
  }

  nodeCollection.disconnected = (nodeId, isUnexpected) => {
    const node = nodes.get(nodeId)
    if (node && node.isAvailable) {
      registry.deregisterServiceByNodeId(node.id)
      node.disconnected()
      broker.broadcastLocal('$node.disconnected', { nodeId, isUnexpected })
      registry.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`)
    }
  }

  nodeCollection.toArray = () => {
    const result = []
    nodes.forEach(node => result.push(node))
    return result
  }

  // get Local node informations and add it to the collection by
  const addLocalNode = () => {
    const node = createNode(broker.nodeId)

    node.isLocal = true
    node.IPList = getIpList()
    node.client = {
      type: 'nodejs',
      version: broker.version,
      nodejsVersion: process.version
    }

    node.sequence = 1
    nodeCollection.add(node.id, node)
    nodeCollection.localNode = node

    return node
  }

  addLocalNode()

  return nodeCollection
}
