"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActionCollection = void 0;
const utils_1 = require("@weave-js/utils");
const endpoint_collection_1 = require("./endpoint-collection");
/**
 * Configuration object for weave service broker.
 * @typedef {Object} ActionCollection
 * @property {Function} add Enable metric middleware. (default = false)
 * @property {Array<String|Object>} adapters Array of metric adapters.
*/
/**
 * Create an action collection.
 * @param {any} registry Reference to the registry.
 * @returns {ActionCollection} Action collection
*/
// todo: define type for action collection
function createActionCollection(registry) {
    const actionCollection = Object.create(null);
    const broker = registry.broker;
    const actions = new Map();
    /**
     * Add a service action to a action collection
     * @export
     * @param {Registry} registry Registry reference
     * @returns
    */
    actionCollection.add = (node, service, action) => {
        let endPointList = actions.get(action.name);
        if (!endPointList) {
            endPointList = endpoint_collection_1.createEndpointCollection(broker, action.name);
            actions.set(action.name, endPointList);
        }
        return endPointList.add(node, service, action);
    };
    actionCollection.get = (actionName) => {
        return actions.get(actionName);
    };
    actionCollection.removeByService = (service) => {
        actions.forEach(list => {
            list.removeByService(service);
        });
    };
    actionCollection.remove = (actionName, node) => {
        // todo: switch property order
        const endpoints = actions.get(actionName);
        if (endpoints) {
            endpoints.removeByNodeId(node.id);
        }
    };
    actionCollection.list = ({ onlyLocals, skipInternals, withEndpoints } = {}) => {
        const result = [];
        actions.forEach((endpointCollection, actionName) => {
            if (skipInternals && /^\$node/.test(actionName)) {
                return;
            }
            if (onlyLocals && !endpointCollection.hasLocal()) {
                return;
            }
            // todo: don't create an new object
            const item = {
                name: actionName,
                hasAvailable: endpointCollection.hasAvailable(),
                hasLocal: endpointCollection.hasLocal(),
                count: endpointCollection.count(),
            };
            if (item.count > 0) {
                const endpoint = endpointCollection.endpoints[0];
                if (endpoint) {
                    item.action = utils_1.omit(endpoint.action, ['handler', 'service']);
                }
            }
            if (item.action == null || item.action.protected) {
                return;
            }
            if (withEndpoints) {
                item.endpoints = endpointCollection.endpoints.map(endpoint => {
                    return {
                        nodeId: endpoint.node.id,
                        state: endpoint.state
                    };
                });
            }
            result.push(item);
        });
        return result;
    };
    return actionCollection;
}
exports.createActionCollection = createActionCollection;
;
//# sourceMappingURL=action-collection.js.map