// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'Constants'... Remove this comment to see the full error message
const { Constants } = require('../metrics');
exports.registerMetrics = (broker) => {
    if (broker.metrics) {
        broker.metrics.register({ name: Constants.WEAVE_ENVIRONMENT, type: 'info', description: 'Node environment.' }).set('nodejs');
        broker.metrics.register({ name: Constants.WEAVE_VERSION, type: 'info', description: 'Weave version.' }).set(broker.version);
        broker.metrics.register({ name: Constants.WEAVE_NODE_ID, type: 'info', description: 'Node ID.' }).set(broker.nodeId);
        broker.metrics.register({ name: Constants.WEAVE_NAMESPACE, type: 'info', description: 'Namespace in which the node runs.' }).set(broker.namespace);
    }
};
