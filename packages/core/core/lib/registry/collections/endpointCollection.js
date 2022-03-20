// @ts-check

/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

/**
 * @typedef {import('../../types.js').Runtime} Runtime
 * @typedef {import('../../types.js').EventCollection} EventCollection
 * @typedef {import('../../types.js').Service} Service
 * @typedef {import('../../types.js').Node} Node
 * @typedef {import('../../types.js').EndpointCollection} EndpointCollection
*/

const { createActionEndpoint } = require('../actionEndpoint');
const { loadBalancingStrategy } = require('../../constants');

/**
 *
 * @param {Runtime} runtime Runtime instance
 * @param {string} name name
 * @param {string=} groupName Group name
 * @returns {EndpointCollection} EndpointCollection
 */
exports.createEndpointList = (runtime, name, groupName) => {
  /** @type {EndpointCollection} */
  const endpointList = Object.create(null);
  const options = runtime.options;
  /** @type {Array} */
  const list = endpointList.endpoints = [];

  let counter = 0;

  endpointList.name = name;
  endpointList.groupName = groupName;
  endpointList.isInternal = name.startsWith('$');
  endpointList.localEndpoints = [];

  const setLocalEndpoints = () => {
    endpointList.localEndpoints = list.filter(endpoint => endpoint.isLocal);
  };

  /**
   * Select an Entpoint with the selected Load-Balancing-Strategy
   * @param {*} endpointList List of all available Endpoints
   * @returns {any} Endpoint
  */
  const select = (endpointList) => {
    // Round robin
    if (options.registry.loadBalancingStrategy === loadBalancingStrategy.ROUND_ROBIN) {
      if (counter >= endpointList.length) {
        counter = 0;
      }
      const res = endpointList[counter++];
      return res;
    } else {
      const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
      return endpointList[randomInt(0, endpointList.length - 1)];
      // todo: implement random load balancer
    }
  };

  endpointList.add = (node, service, action) => { // todo: addaction
    const foundEndpoint = list.find(endpoint => endpoint.node.id === node.id && endpoint.service.name === service.name);

    if (foundEndpoint) {
      foundEndpoint.updateAction(action);
      return false;
    }

    const newEndpoint = createActionEndpoint(runtime, node, service, action);

    list.push(newEndpoint);
    setLocalEndpoints();
    return true;
  };

  endpointList.hasAvailable = () => list.find(endpoint => endpoint.isAvailable()) != null;

  endpointList.hasLocal = () => endpointList.localEndpoints.length > 0;

  endpointList.getNextAvailableEndpoint = () => {
    if (list.length === 0) {
      return null;
    }

    // If there is a local service, get a local endpoint
    if (endpointList.isInternal && endpointList.hasLocal()) {
      return endpointList.getNextLocalEndpoint();
    }

    // If only one endpoint is available return this.
    if (list.length === 1) {
      const endpoint = list[0];
      if (endpoint.isAvailable()) {
        return endpoint;
      }
      return null;
    }

    if (options.registry.preferLocalActions && endpointList.hasLocal()) {
      const endpoint = endpointList.getNextLocalEndpoint();
      if (endpoint && endpoint.isAvailable()) {
        return endpoint;
      }
    }

    const availableEndpoints = list.filter(endpoint => endpoint.isAvailable());
    if (availableEndpoints.length === 0) {
      return null;
    }

    return select(availableEndpoints);
  };

  endpointList.getNextLocalEndpoint = () => {
    if (endpointList.localEndpoints.length === 0) {
      return null;
    }

    if (list.length === 1) {
      const endpoint = endpointList.localEndpoints[0];
      if (endpoint.isAvailable()) {
        return endpoint;
      }
      return null;
    }

    const availableEndpoints = endpointList.localEndpoints.filter(endpoint => endpoint.isAvailable());
    if (availableEndpoints.length === 0) {
      return null;
    }

    return select(availableEndpoints);
  };

  endpointList.count = () => list.length;

  endpointList.getByNodeId = (nodeId) => list.find(endpoint => endpoint.node.id === nodeId);

  endpointList.removeByNodeId = (nodeId) => {
    const endpointToRemove = list.find(item => item.node.id === nodeId);
    list.splice(list.indexOf(endpointToRemove), 1);
    setLocalEndpoints();
  };

  endpointList.removeByService = (service) => {
    const endpointToRemove = list.find(endpoint => endpoint.service === service);
    if (endpointToRemove) {
      list.splice(list.indexOf(endpointToRemove), 1);
    }
    setLocalEndpoints();
  };

  return endpointList;
};
