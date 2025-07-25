// @ts-check

/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

/**
 * @typedef {import('../../types.__js').Registry} Registry
 * @typedef {import('../../types.__js').NodeCollection} NodeCollection
*/

const { getIpList, omit } = require('@weave-js/utils');
const { createNode } = require('../node');
/**
 * Create node collection
 * @param {Registry} registry Registry reference
 * @return {NodeCollection} Node collection
 */
exports.createNodeCollection = (registry) => {
  const nodeCollection = Object.create(null);
  const { runtime } = registry;
  const nodes = new Map();

  nodeCollection.localNode = null;

  nodeCollection.createNode = (nodeId) => {
    return createNode(nodeId);
  };

  nodeCollection.add = (id, node) => {
    nodes.set(id, node);
  };

  nodeCollection.has = (id) => {
    return nodes.has(id);
  };

  nodeCollection.get = (id) => {
    return nodes.get(id);
  };

  nodeCollection.remove = (id) => {
    return nodes.delete(id);
  };

  nodeCollection.list = ({ withServices = true } = {}) => {
    const result = [];
    nodes.forEach(node => {
      if (withServices) {
        result.push(omit(node, ['info']));
      } else {
        result.push(omit(node, ['info', 'services']));
      }
    });
    return result;
  };

  nodeCollection.disconnected = (nodeId, isUnexpected) => {
    const node = nodes.get(nodeId);
    if (node && node.isAvailable) {
      registry.deregisterServiceByNodeId(node.id);
      node.disconnected(isUnexpected);
      runtime.eventBus.broadcastLocal('$node.disconnected', nodeId, isUnexpected);
      registry.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
    }
  };

  nodeCollection.toArray = () => {
    const result = [];
    nodes.forEach(node => result.push(node));
    return result;
  };

  // get Local node information and add it to the collection by
  const addLocalNode = () => {
    const node = createNode(runtime.options.nodeId);

    node.isLocal = true;
    node.IPList = getIpList();
    node.client = {
      type: 'nodejs',
      version: runtime.version,
      langVersion: process.version
    };

    node.sequence = 1;
    nodeCollection.add(node.id, node);
    nodeCollection.localNode = node;

    return node;
  };

  addLocalNode();

  return nodeCollection;
};
