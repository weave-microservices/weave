"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActionEndpoint = void 0;
function createActionEndpoint(broker, node, service, action) {
    const endpoint = Object.create(null);
    endpoint.node = node;
    endpoint.service = service;
    endpoint.action = action;
    endpoint.isLocal = node.id === broker.nodeId;
    endpoint.state = true;
    endpoint.name = `${node.id}:${action.name}`;
    endpoint.updateAction = (newAction) => {
        endpoint.action = newAction;
    };
    endpoint.isAvailable = () => {
        return endpoint.state === true;
    };
    return endpoint;
}
exports.createActionEndpoint = createActionEndpoint;
;
//# sourceMappingURL=action-endpoint.js.map