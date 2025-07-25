// @ts-check

/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

/**
 * @typedef {import('../../types.__js').Registry} Registry
 * @typedef {import('../../types.__js').ServiceActionCollection} ServiceActionCollection
*/
const { omit } = require('@weave-js/utils');
const { createEndpointList } = require('./endpointCollection');

/**
 * Configuration object for weave service broker.
 * @typedef {Object} ActionCollection
 * @property {Function} add Enable metric middleware. (default = false)
 * @property {Array<String|Object>} adapters Array of metric adapters.
*/

/**
 * Create an action collection.
 * @param {Registry} registry Reference to the registry.
 * @returns {ServiceActionCollection} Action collection
*/
exports.createActionCollection = (registry) => {
  /**
   * @type {ServiceActionCollection}
  */
  const actionCollection = Object.create(null);
  const { runtime } = registry;
  const actions = new Map();

  actionCollection.add = (node, service, action) => {
    let endPointList = actions.get(action.name);
    if (!endPointList) {
      endPointList = createEndpointList(runtime, action.name);
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

  actionCollection.list = ({
    onlyLocals = false,
    skipInternals = false,
    withEndpoints = false
  } = {}) => {
    const result = [];

    actions.forEach(action => {
      if (skipInternals && /^\$node/.test(action.name)) {
        return;
      }

      if (onlyLocals && !action.hasLocal()) {
        return;
      }

      // todo: don't create an new object
      const item = {
        name: action.name,
        hasAvailable: action.hasAvailable(),
        hasLocal: action.hasLocal(),
        count: action.count()
      };

      if (item.count > 0) {
        const endpoint = action.endpoints[0];
        if (endpoint) {
          item.action = omit(endpoint.action, ['handler', 'service']);
        }
      }

      if (item.action == null || item.action.protected) {
        return;
      }

      if (withEndpoints) {
        item.endpoints = action.endpoints.map(endpoint => {
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
};
