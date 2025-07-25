// @ts-check

/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

/**
 * @typedef {import('../../types.__js').Registry} Registry
 * @typedef {import('../../types.__js').ServiceCollection} ServiceCollection
*/

// const { createEndpointCollection } = require('./endpoint-collection')
const { omit, remove } = require('@weave-js/utils');
const { createServiceItem } = require('../serviceItem');

/**
 * Service collection factory
 * @param {Registry} registry Registry instance
 * @returns {ServiceCollection} Service collection
*/
exports.createServiceCollection = (registry) => {
  /** @type {ServiceCollection} */
  const serviceCollection = Object.create(null);
  const { runtime } = registry;
  const services = serviceCollection.services = [];
  const actions = new Map();
  // const options = broker.options

  // const findServiceByNode = (nodeId, name) => {
  //   return services.find(service => service.name === name && service.nodeId === nodeId)
  // }

  serviceCollection.add = (node, name, version, settings) => {
    const item = createServiceItem(node, name, version, settings, node.id === runtime.nodeId);
    services.push(item);
    return item;
  };

  serviceCollection.get = (nodeId, name, version) => services.find(svc => svc.equals(name, version, nodeId));

  serviceCollection.has = (name, version, nodeId) => {
    return !!services.find(svc => svc.equals(name, version, nodeId));
  };

  serviceCollection.remove = (nodeId, name, version) => {
    const service = serviceCollection.get(nodeId, name, version);

    if (service) {
      registry.actionCollection.removeByService(service);
      registry.eventCollection.removeByService(service);
      remove(services, svc => svc === service);
    }
  };

  serviceCollection.removeAllByNodeId = (nodeId) => {
    remove(services, service => {
      if (service.node.id === nodeId) {
        registry.actionCollection.removeByService(service);
        registry.eventCollection.removeByService(service);
        return true;
      }
      return false;
    });
  };

  serviceCollection.tryFindActionsByActionName = (actionName) => actions.get(actionName);

  serviceCollection.getActionsList = () => {
    const result = [];
    actions.forEach((action, key) => {
      const item = {
        name: key,
        count: action.count(),
        hasLocal: action.hasLocal()
      };
      result.push(item);
    });
    return result;
  };

  serviceCollection.list = ({
    localOnly = false,
    withActions = false,
    withEvents = false,
    withNodeService = false,
    withSettings = false,
    withPrivate = false
  } = {}) => {
    const result = [];
    services.forEach((service) => {
      if (/^\$node/.test(service.name) && !withNodeService) {
        return;
      }

      const isPrivate = service.settings && service.settings.$private;

      if (isPrivate && withPrivate === false) {
        return;
      }

      if (localOnly && !service.isLocal) {
        return;
      }

      const item = {
        name: service.name,
        nodeId: service.node.id,
        version: service.version,
        isAvailable: service.node.isAvailable,
        isPrivate
      };

      if (withSettings) {
        item.settings = service.settings;
      }

      if (withActions) {
        item.actions = {};
        Object.values(service.actions)
          .forEach(action => {
            item.actions[action.name] = omit(action, ['handler', 'service']);
          });
      }

      if (withEvents) {
        item.events = {};
        Object.values(service.events)
          .forEach(event => {
            item.events[event.name] = omit(event, ['service', 'handler']);
          });
      }

      result.push(item);
    });
    return result;
  };

  serviceCollection.findEndpointByNodeId = (actionName, nodeId) => {
    const endpointListItem = serviceCollection.tryFindActionsByActionName(actionName);
    if (endpointListItem) {
      return endpointListItem.endpointByNodeId(nodeId);
    }
  };

  return serviceCollection;
};
