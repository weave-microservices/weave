// @ts-check

import { Runtime } from "../../runtime/Runtime";
import { Service } from "../../service/Service";
import { Node } from "../Node";
import { Registry } from "../Registry";
import { ServiceItem } from "../serviceItem";

/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

// const { createEndpointCollection } = require('./endpoint-collection')
const { omit, remove } = require('@weave-js/utils');

export type ServiceListItem = {
  name: string;
  nodeId: string;
  version: number;
  isAvailable: boolean;
  settings?: unknown;
  actions?: Record<string, any>;
  events?: Record<string, any>;
}
class ServiceCollection {
  #actions: Map<any, any>;
  services: Array<ServiceItem>;

  constructor (runtime: Runtime) {
    this.#actions = new Map()
    this.services = []
  }

  public add (node: Node, name: string, version: number, settings: unknown) {
    const item = new ServiceItem(node, name, version, settings, node.id === runtime.nodeId);
    this.services.push(item);
    return item;
  };

  public get (nodeId: string, name: string, version?: number): ServiceItem {
    return this.services.find((service) => {
      return service.equals(name, version, nodeId)
    })
  }

  has (name: string, version: number, nodeId: string) {
    return !!this.services.find(service => service.equals(name, version, nodeId));
  };

  remove (nodeId: string, name: string, version: number) {
    const service = this.get(nodeId, name, version);

    if (service) {
      registry.actionCollection.removeByService(service);
      registry.eventCollection.removeByService(service);
      remove(services, svc => svc === service);
    }
  };

  removeAllByNodeId (nodeId: string): boolean {
    remove(this.services, (service) => {
      if (service.node.id === nodeId) {
        registry.actionCollection.removeByService(service);
        registry.eventCollection.removeByService(service);
        return true;
      }
      return false;
    });
  };

  tryFindActionsByActionName (actionName: string) {
    return this.#actions.get(actionName);
  }

  getActionsList () {
    const result = [];
    this.#actions.forEach((action, key) => {
      const item = {
        name: key,
        count: action.count(),
        hasLocal: action.hasLocal()
      };
      result.push(item);
    });
    return result;
  };

  list ({
    localOnly = false,
    withActions = false,
    withEvents = false,
    withNodeService = false,
    withSettings = false
  }: {
    localOnly?: boolean;
    withActions?: boolean;
    withEvents?: boolean;
    withNodeService?: boolean;
    withSettings?: boolean;
  } = {}): Array<ServiceListItem> {
    const result: Array<ServiceListItem> = [];
    this.services.forEach((service) => {
      if (/^\$node/.test(service.name) && !withNodeService) {
        return;
      }
      if (service.settings && service.settings.$private) {
        return;
      }

      if (localOnly && !service.isLocal) {
        return;
      }

      const item: ServiceListItem = {
        name: service.name,
        nodeId: service.node.id,
        version: service.version,
        isAvailable: service.node.isAvailable
      };

      if (withSettings) {
        item.settings = service.settings;
      }

      if (withActions) {
        item.actions = {};
        Object.values(service.actions)
          .forEach(action => {
            item.actions![action.name] = omit(action, ['handler', 'service']);
          });
      }

      if (withEvents) {
        item.events = {};
        Object.values(service.events)
          .forEach(event => {
            item.events![event.name] = omit(event, ['service', 'handler']);
          });
      }

      result.push(item);
    });
    return result;
  };

  findEndpointByNodeId (actionName: string, nodeId: string) {
    const endpointListItem = this.tryFindActionsByActionName(actionName);
    if (endpointListItem) {
      return endpointListItem.endpointByNodeId(nodeId);
    }
  };
}

export { ServiceCollection };

// exports.createServiceCollection = (registry: Registry) => {
//   const serviceCollection = Object.create(null);
//   const { runtime } = registry;
//   const services = serviceCollection.services = [];
//   const actions = new Map();
//   // const options = broker.options

//   // const findServiceByNode = (nodeId, name) => {
//   //   return services.find(service => service.name === name && service.nodeId === nodeId)
//   // }

//   serviceCollection.add = (node, name, version, settings) => {
//     const item = createServiceItem(node, name, version, settings, node.id === runtime.nodeId);
//     services.push(item);
//     return item;
//   };

//   serviceCollection.get = (nodeId, name, version) => services.find(svc => svc.equals(name, version, nodeId));

//   serviceCollection.has = (name, version, nodeId) => {
//     return !!services.find(svc => svc.equals(name, version, nodeId));
//   };

//   serviceCollection.remove = (nodeId, name, version) => {
//     const service = serviceCollection.get(nodeId, name, version);

//     if (service) {
//       registry.actionCollection.removeByService(service);
//       registry.eventCollection.removeByService(service);
//       remove(services, svc => svc === service);
//     }
//   };

//   serviceCollection.removeAllByNodeId = (nodeId) => {
//     remove(services, service => {
//       if (service.node.id === nodeId) {
//         registry.actionCollection.removeByService(service);
//         registry.eventCollection.removeByService(service);
//         return true;
//       }
//       return false;
//     });
//   };

//   serviceCollection.tryFindActionsByActionName = (actionName) => actions.get(actionName);

//   serviceCollection.getActionsList = () => {
//     const result = [];
//     actions.forEach((action, key) => {
//       const item = {
//         name: key,
//         count: action.count(),
//         hasLocal: action.hasLocal()
//       };
//       result.push(item);
//     });
//     return result;
//   };

//   serviceCollection.list = ({
//     localOnly = false,
//     withActions = false,
//     withEvents = false,
//     withNodeService = false,
//     withSettings = false
//   } = {}) => {
//     const result = [];
//     services.forEach((service) => {
//       if (/^\$node/.test(service.name) && !withNodeService) {
//         return;
//       }
//       if (service.settings && service.settings.$private) {
//         return;
//       }

//       if (localOnly && !service.isLocal) {
//         return;
//       }

//       const item = {
//         name: service.name,
//         nodeId: service.node.id,
//         version: service.version,
//         isAvailable: service.node.isAvailable
//       };

//       if (withSettings) {
//         item.settings = service.settings;
//       }

//       if (withActions) {
//         item.actions = {};
//         Object.values(service.actions)
//           .forEach(action => {
//             item.actions[action.name] = omit(action, ['handler', 'service']);
//           });
//       }

//       if (withEvents) {
//         item.events = {};
//         Object.values(service.events)
//           .forEach(event => {
//             item.events[event.name] = omit(event, ['service', 'handler']);
//           });
//       }

//       result.push(item);
//     });
//     return result;
//   };

//   serviceCollection.findEndpointByNodeId = (actionName: string, nodeId: string) => {
//     const endpointListItem = serviceCollection.tryFindActionsByActionName(actionName);
//     if (endpointListItem) {
//       return endpointListItem.endpointByNodeId(nodeId);
//     }
//   };

//   return serviceCollection;
// };
