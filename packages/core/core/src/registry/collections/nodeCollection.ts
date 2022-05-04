// @ts-check

import { Runtime } from "../../runtime/Runtime";

/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { getIpList, omit } = require('@weave-js/utils');
import { Node } from '../Node'

class NodeCollection {
  #nodes: Map<string, Node>;
  localNode?: Node;

  constructor (runtime: Runtime) {
    this.#nodes = new Map();
  }

  createNode (nodeId: string): Node {
    return new Node(nodeId);
  };

  add (id: string, node: Node) {
    this.#nodes.set(id, node);
  };

  has (id: string): boolean {
    return this.#nodes.has(id);
  };

  get (id: string): Node | undefined {
    return this.#nodes.get(id);
  };

  remove (id: string): boolean {
    return this.#nodes.delete(id);
  };

  list ({
    withServices = true
  }: {
    withServices?: boolean
  } = {}) {
    const result = [];
    this.#nodes.forEach((node) => {
      if (withServices) {
        result.push(omit(node, ['info']));
      } else {
        result.push(omit(node, ['info', 'services']));
      }
    });
    return result;
  };

  // todo: Move!!!
  disconnected (nodeId: string, isUnexpected: boolean) {
    const node = this.#nodes.get(nodeId);
    if (node && node.isAvailable) {
      registry.deregisterServiceByNodeId(node.id);
      node.disconnected(isUnexpected);
      runtime.eventBus.broadcastLocal('$node.disconnected', nodeId, isUnexpected);
      registry.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
    }
  };

  toArray () {
    const result: Array<Node> = [];
    this.#nodes.forEach((node) => result.push(node));
    return result;
  };
}

export { NodeCollection }

// exports.createNodeCollection = (registry) => {
//   const nodeCollection = Object.create(null);
//   const { runtime } = registry;
//   const nodes = new Map();

//   nodeCollection.localNode = null;

//   nodeCollection.createNode = (nodeId) => {
//     return createNode(nodeId);
//   };

//   nodeCollection.add = (id, node) => {
//     nodes.set(id, node);
//   };

//   nodeCollection.has = (id) => {
//     return nodes.has(id);
//   };

//   nodeCollection.get = (id) => {
//     return nodes.get(id);
//   };

//   nodeCollection.remove = (id) => {
//     return nodes.delete(id);
//   };

//   nodeCollection.list = ({ withServices = true } = {}) => {
//     const result = [];
//     nodes.forEach(node => {
//       if (withServices) {
//         result.push(omit(node, ['info']));
//       } else {
//         result.push(omit(node, ['info', 'services']));
//       }
//     });
//     return result;
//   };

//   nodeCollection.disconnected = (nodeId, isUnexpected) => {
//     const node = nodes.get(nodeId);
//     if (node && node.isAvailable) {
//       registry.deregisterServiceByNodeId(node.id);
//       node.disconnected(isUnexpected);
//       runtime.eventBus.broadcastLocal('$node.disconnected', nodeId, isUnexpected);
//       registry.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
//     }
//   };

//   nodeCollection.toArray = () => {
//     const result = [];
//     nodes.forEach(node => result.push(node));
//     return result;
//   };

//   // get Local node information and add it to the collection by
//   const addLocalNode = () => {
//     const node = createNode(runtime.options.nodeId);

//     node.isLocal = true;
//     node.IPList = getIpList();
//     node.client = {
//       type: 'nodejs',
//       version: runtime.version,
//       langVersion: process.version
//     };

//     node.sequence = 1;
//     nodeCollection.add(node.id, node);
//     nodeCollection.localNode = node;

//     return node;
//   };

//   addLocalNode();

//   return nodeCollection;
// };
