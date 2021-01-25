"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
const utils_1 = require("@weave-js/utils");
const errors_1 = require("../errors");
function createContext(broker) {
    const context = {
        id: null,
        nodeId: broker.nodeId || null,
        callerNodeId: null,
        parentContext: null,
        endpoint: null,
        data: {},
        meta: {},
        info: {},
        level: 1,
        tracing: null,
        span: null,
        service: null,
        options: {},
        duration: 0,
        stopTime: 0,
        setData(newParams) {
            this.data = newParams || {};
        },
        setEndpoint(endpoint) {
            this.nodeId = endpoint.node.id;
            this.endpoint = endpoint;
            this.action = endpoint.action;
            this.service = endpoint.action.service;
        },
        /**
         * Emit an event
         * @param {string} eventName Name of the event
         * @param {Object} payload Payload of the event
         * @param {EventOptions} [options={}]
         * @returns {Promise<any>}
        */
        emit(eventName, payload, options = {}) {
            options.parentContext = this;
            return broker.emit(eventName, payload, options);
        },
        broadcast(eventName, payload, options = {}) {
            options.parentContext = this;
            return broker.broadcast(eventName, payload, options);
        },
        /**
         * Call a action.
         * @param {string} actionName Name of the action.
         * @param {object} params Parameter
         * @param {object} [options={}] Call options
         * @returns {Promise} Promise
        */
        call(actionName, params, options = {}) {
            options.parentContext = this;
            if (broker.options.registry.maxCallLevel > 0 && this.level >= broker.options.registry.maxCallLevel) {
                return Promise.reject(new errors_1.WeaveMaxCallLevelError({ nodeId: broker.nodeId, maxCallLevel: broker.options.registry.maxCallLevel }));
            }
            const p = broker.call(actionName, params, options);
            return p.then(result => {
                if (p.context) {
                    this.meta = Object.assign(this.meta, p.context.meta);
                }
                return result;
            });
        },
        startSpan(name, options) {
            if (this.span) {
                this.span = this.span.startChildSpan(name, options);
            }
            else {
                this.span = broker.tracer.startSpan(name, options);
            }
            return this.span;
        },
        finishSpan() {
            if (this.span) {
                this.span.finish();
                return this.span;
            }
        },
        copy() {
            const newContext = createContext(broker);
            newContext.nodeId = this.nodeId;
            newContext.options = this.options;
            newContext.data = this.data;
            newContext.meta = this.meta;
            newContext.parentContext = this.parentContext;
            newContext.callerNodeId = this.callerNodeId;
            newContext.level = this.level;
            newContext.options = this.options;
            newContext.eventName = this.eventName;
            newContext.eventType = this.eventType;
            newContext.eventGroups = this.eventGroups;
            return newContext;
        }
    };
    // generate context Id
    if (!context.id) {
        // Use custom UUID factory
        if (broker.options.uuidFactory && utils_1.isFunction(broker.options.uuidFactory)) {
            context.id = broker.options.uuidFactory.call(context, broker);
        }
        else {
            context.id = utils_1.uuid();
        }
        // Pass existing request ID
        if (!context.requestId) {
            context.requestId = context.id;
        }
    }
    return context;
}
exports.createContext = createContext;
;
//# sourceMappingURL=context.js.map