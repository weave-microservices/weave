/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServiceItem = void 0;
// todo: find a better name
function createServiceItem(node, name, version, settings, isLocal) {
    const serviceItem = Object.create(null);
    serviceItem.name = name;
    serviceItem.node = node;
    serviceItem.settings = settings || {};
    serviceItem.version = version;
    serviceItem.actions = {};
    serviceItem.events = {};
    serviceItem.isLocal = isLocal;
    serviceItem.addAction = (action) => {
        serviceItem.actions[action.name] = action;
    };
    serviceItem.addEvent = (event) => {
        serviceItem.events[event.name] = event;
    };
    serviceItem.equals = (name, version, nodeId) => {
        return serviceItem.name === name && serviceItem.version === version && (nodeId == null || serviceItem.node.id === nodeId);
    };
    serviceItem.update = (service) => {
        serviceItem.settings = service.settings;
        serviceItem.version = service.version;
    };
    return serviceItem;
}
exports.createServiceItem = createServiceItem;
//# sourceMappingURL=service-item.js.map