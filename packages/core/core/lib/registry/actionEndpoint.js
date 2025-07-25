/**
 * @typedef {import("../types.__js").Runtime} Runtime
 * @typedef {import("../types.__js").Endpoint} Endpoint
 * @typedef {import("../types.__js").Node} Node
 * @typedef {import("../types.__js").Service} Service
 * @typedef {import("../types.__js").ServiceAction} ServiceAction
*/

/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

/**
 * Action endpoind factory
 * @param {Runtime} runtime broker
 * @param {Node} node node
 * @param {Service} service service
 * @param {ServiceAction} action action
 * @returns {Endpoint} Endpoint
*/
exports.createActionEndpoint = (runtime, node, service, action) => {
  /**
   * @type {Endpoint}
  */
  const endpoint = {
    node,
    service,
    action,
    isLocal: node.id === runtime.nodeId,
    state: true,
    name: `${node.id}:${action.name}`
  };

  endpoint.updateAction = (newAction) => {
    endpoint.action = newAction;
  };

  endpoint.isAvailable = () => {
    return endpoint.state === true;
  };

  return endpoint;
};
