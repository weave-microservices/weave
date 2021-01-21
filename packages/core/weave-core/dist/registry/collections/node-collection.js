/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getIpList'... Remove this comment to see the full error message
const { getIpList, omit } = require('@weave-js/utils');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'createNode... Remove this comment to see the full error message
const { createNode } = require('../node');
exports.createNodeCollection = (registry) => {
    const nodeCollection = Object.create(null);
    const broker = registry.broker;
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
            }
            else {
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
            broker.broadcastLocal('$node.disconnected', nodeId, isUnexpected);
            registry.log.warn(`Node '${node.id}'${isUnexpected ? ' unexpectedly' : ''} disconnected.`);
        }
    };
    nodeCollection.toArray = () => {
        const result = [];
        nodes.forEach(node => result.push(node));
        return result;
    };
    // get Local node informations and add it to the collection by
    const addLocalNode = () => {
        const node = createNode(broker.nodeId);
        node.isLocal = true;
        node.IPList = getIpList();
        node.client = {
            type: 'nodejs',
            version: broker.version,
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
