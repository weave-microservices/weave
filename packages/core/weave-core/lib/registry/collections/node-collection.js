"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodeCollection = void 0;
const utils_1 = require("@weave-js/utils");
const node_1 = require("../node");
function createNodeCollection(registry) {
    const nodeCollection = Object.create(null);
    const broker = registry.broker;
    const nodes = new Map();
    nodeCollection.localNode = null;
    nodeCollection.createNode = (nodeId) => {
        return node_1.createNode(nodeId);
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
                result.push(utils_1.omit(node, ['info']));
            }
            else {
                result.push(utils_1.omit(node, ['info', 'services']));
            }
        });
        return result;
    };
    nodeCollection.disconnected = (nodeId, isUnexpected) => {
        const node = nodes.get(nodeId);
        if (node && node.isAvailable) {
            registry.deregisterServiceByNodeId(node.id);
            node.disconnected();
            broker.broadcastLocal('$node.disconnected', { nodeId, isUnexpected });
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
        const node = node_1.createNode(broker.nodeId);
        node.isLocal = true;
        node.IPList = utils_1.getIpList();
        node.client = {
            type: 'nodejs',
            version: broker.version,
            nodejsVersion: process.version
        };
        node.sequence = 1;
        nodeCollection.add(node.id, node);
        nodeCollection.localNode = node;
        return node;
    };
    addLocalNode();
    return nodeCollection;
}
exports.createNodeCollection = createNodeCollection;
//# sourceMappingURL=node-collection.js.map