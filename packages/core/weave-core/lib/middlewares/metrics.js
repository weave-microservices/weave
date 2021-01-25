"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMetricsMiddleware = void 0;
const Constants = __importStar(require("../metrics/constants"));
function createMetricsMiddleware() {
    function wrapMetricMiddleware(type, action, handler) {
        const broker = this;
        const options = broker.options.metrics || {};
        const serviceName = action.service ? action.service.fullyQualifiedName : null;
        const actionName = action.name;
        if (options.enabled) {
            return function metricMiddleware(context) {
                const callerNodeId = context.callerNodeId;
                broker.metrics.increment(Constants.REQUESTS_TOTAL, { type, serviceName, actionName, callerNodeId });
                broker.metrics.increment(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId });
                return handler(context)
                    .then(result => {
                    broker.metrics.decrement(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId });
                    return result;
                })
                    .catch(error => {
                    broker.metrics.decrement(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId });
                    broker.metrics.increment(Constants.REQUESTS_ERRORS_TOTAL);
                    broker.handleError(error);
                });
            };
        }
        return handler;
    }
    const metricMiddleware = {
        created() {
            const options = this.options.metrics || {};
            if (options.enabled) {
                // Request metrics
                this.metrics.register({ type: 'counter', name: Constants.REQUESTS_TOTAL, description: 'Number of total requests.' });
                this.metrics.register({ type: 'gauge', name: Constants.REQUESTS_IN_FLIGHT, description: 'Number of running requests.' });
                this.metrics.register({ type: 'counter', name: Constants.REQUESTS_ERRORS_TOTAL, description: 'Number of failed requests.' });
                // Event metrics
                this.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_EMITS, description: 'Number of total emitted events.' });
                this.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_BROADCASTS, description: 'Number of total broadcasted events.' });
                this.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_BROADCASTS_LOCAL, description: 'Number of total local broadcasted events.' });
                this.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_RECEIVED, description: 'Number of total received events.' });
                // Transport metrics
                this.metrics.register({ type: 'gauge', name: Constants.TRANSPORT_IN_FLIGHT_STREAMS, description: 'Number of in flight streams.' });
                this.metrics.register({ type: 'counter', name: Constants.TRANSPORTER_PACKETS_SENT, description: 'Number of in flight streams.' });
                this.metrics.register({ type: 'counter', name: Constants.TRANSPORTER_PACKETS_RECEIVED, description: 'Number of in flight streams.' });
                this.metrics.register({ type: 'gauge', name: Constants.TRANSPORT_IN_FLIGHT_STREAMS, description: 'Number of in flight streams.' });
            }
        },
        localAction(next, action) {
            const options = this.options.metrics || {};
            if (options.enabled) {
                return wrapMetricMiddleware.call(this, 'local', action, next);
            }
            return next;
        },
        remoteAction(next, action) {
            const options = this.options.metrics || {};
            if (options.enabled) {
                return wrapMetricMiddleware.call(this, 'remote', action, next);
            }
            return next;
        },
        emit(next) {
            return (event, payload) => {
                this.metrics.increment(Constants.EVENT_TOTAL_EMITS);
                return next(event, payload);
            };
        },
        broadcast(next) {
            return (event, payload) => {
                this.metrics.increment(Constants.EVENT_TOTAL_BROADCASTS);
                return next(event, payload);
            };
        },
        broadcastLocal(next) {
            return (event, payload) => {
                this.metrics.increment(Constants.EVENT_TOTAL_BROADCASTS_LOCAL);
                return next(event, payload);
            };
        }
    };
    return metricMiddleware;
}
exports.createMetricsMiddleware = createMetricsMiddleware;
//# sourceMappingURL=metrics.js.map