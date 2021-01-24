/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { omit } from '@weave-js/utils';
import { createEndpointCollection, EndpointCollection } from './endpoint-collection';
import { Node } from "../node";
import { Registry } from '../../shared/interfaces/registry.interface';
import { Broker } from '../../shared/interfaces/broker.interface';
import { ServiceAction } from '../../shared/interfaces/service-action.interface';
import { Service } from '../../shared/interfaces/service.interface';
import { ServiceActionListFilterParameters } from '../../shared/types/service-actions-list-filter-parameters.type';

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
export function createActionCollection (registry: Registry) { 
    const actionCollection = Object.create(null);
    const broker: Broker = registry.broker;
    const actions: Map<string, EndpointCollection> = new Map();

    /**
     * Add a service action to a action collection
     * @export
     * @param {Registry} registry Registry reference
     * @returns 
    */
    actionCollection.add = (node: Node, service: Service, action: ServiceAction) => {
        let endPointList = actions.get(action.name);
        
        if (!endPointList) {
            endPointList = createEndpointCollection(broker, action.name);
            actions.set(action.name, endPointList);
        }
        
        return endPointList.add(node, service, action);
    };
    
    actionCollection.get = (actionName: string) => {
        return actions.get(actionName);
    };

    actionCollection.removeByService = (service) => {
        actions.forEach(list => {
            list.removeByService(service);
        });
    };

    actionCollection.remove = (actionName: string, node) => {
        // todo: switch property order
        const endpoints = actions.get(actionName);
        if (endpoints) {
            endpoints.removeByNodeId(node.id);
        }
    };

    actionCollection.list = ({ onlyLocals, skipInternals, withEndpoints }: ServiceActionListFilterParameters = {}) => {
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
                // params: endpointCollection.params
            };
            
            if (item.count > 0) {
                const endpoint = endpointCollection.endpoints[0];
                if (endpoint) {
                    (item as any).action = omit(endpoint.action, ['handler', 'service']);
                }
            }
            
            if ((item as any).action == null || (item as any).action.protected) {
                return;
            }

            if (withEndpoints) {
                (item as any).endpoints = endpointCollection.endpoints.map(endpoint => {
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
