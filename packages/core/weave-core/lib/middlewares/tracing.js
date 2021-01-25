"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTracingMiddleware = void 0;
const buildTags = (context) => {
    return {
        requestLevel: context.level,
        action: context.action ? { name: context.action.name, shortName: context.action.shortName } : null,
        isRemoteCall: !!context.callerNodeId,
        nodeId: context.nodeId
    };
};
const wrapTracingLocalActionMiddleware = function (handler) {
    const broker = this;
    const options = broker.options.tracing || {};
    if (options.enabled) {
        return function metricsLocalMiddleware(context) {
            const tags = buildTags(context);
            const spanName = `action '${context.action.name}'`;
            const span = context.startSpan(spanName, {
                id: context.id,
                traceId: context.requestId,
                parentId: context.parentId,
                type: 'action',
                service: context.service,
                tags,
                sampled: context.tracing
            });
            context.span = span;
            return handler(context)
                .then(result => {
                span.finish();
                return result;
            })
                .catch(error => {
                span
                    .setError(error)
                    .finish();
                return Promise.reject(error);
            });
        };
    }
    return handler;
};
const wrapTracingLocalEventMiddleware = function (handler, event) {
    const broker = this;
    const service = event.service;
    const options = broker.options.tracing || { enabled: false };
    if (options.enabled) {
        return function metricsLocalMiddleware(context) {
            const tags = buildTags(context);
            const span = context.startSpan(`event '${context.eventName}'`, {
                id: context.id,
                traceId: context.requestId,
                parentId: context.parentId,
                type: 'event',
                service,
                tags,
                sampled: context.tracing
            });
            context.span = span;
            return handler(context)
                .then(result => {
                span.addTags(tags);
                span.finish();
                return result;
            })
                .catch(error => {
                span
                    .setError(error)
                    .finish();
                return Promise.reject(error);
            });
        };
    }
    return handler;
};
function createTracingMiddleware() {
    return {
        localAction: wrapTracingLocalActionMiddleware,
        localEvent: wrapTracingLocalEventMiddleware
    };
}
exports.createTracingMiddleware = createTracingMiddleware;
//# sourceMappingURL=tracing.js.map