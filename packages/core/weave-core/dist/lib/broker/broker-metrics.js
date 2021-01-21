"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMetrics = void 0;
const metrics_1 = require("../metrics");
function registerMetrics(broker) {
    if (broker.metrics) {
        broker.metrics.register({ name: metrics_1.Constants.WEAVE_ENVIRONMENT, type: 'info', description: 'Node environment.' }).set('nodejs');
        broker.metrics.register({ name: metrics_1.Constants.WEAVE_VERSION, type: 'info', description: 'Weave version.' }).set(broker.version);
        broker.metrics.register({ name: metrics_1.Constants.WEAVE_NODE_ID, type: 'info', description: 'Node ID.' }).set(broker.nodeId);
        broker.metrics.register({ name: metrics_1.Constants.WEAVE_NAMESPACE, type: 'info', description: 'Namespace in which the node runs.' }).set(broker.namespace);
    }
}
exports.registerMetrics = registerMetrics;
