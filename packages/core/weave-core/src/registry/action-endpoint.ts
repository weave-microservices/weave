/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Broker } from "../shared/interfaces/broker.interface"
import { Endpoint } from "../shared/interfaces/endpoint.interface"
import { Node } from "../shared/interfaces/node.interface"
import { ServiceAction } from "../shared/interfaces/service-action.interface"
import { Service } from "../shared/interfaces/service.interface"

export function createActionEndpoint(broker: Broker, node: Node, service: Service, action: ServiceAction): Endpoint {
    const endpoint: Endpoint = Object.create(null)
    endpoint.node = node
    endpoint.service = service
    endpoint.action = action
    endpoint.isLocal = node.id === broker.nodeId
    endpoint.state = true
    endpoint.name = `${node.id}:${action.name}`


    endpoint.updateAction = (newAction: ServiceAction) => {
        endpoint.action = newAction;
    };

    endpoint.isAvailable = () => {
        return endpoint.state === true;
    };

    return endpoint;
};
