/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Broker } from "../broker/broker";
import { Node } from "./node";
import { Service, ServiceAction } from "./service";

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
