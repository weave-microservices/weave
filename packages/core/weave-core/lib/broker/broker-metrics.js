const { Constants } = require('../metrics')

exports.registerMetrics = (runtime) => {
  runtime.metrics.register({ name: Constants.WEAVE_ENVIRONMENT, type: 'info', description: 'Environment' }).set('Node.js')
  runtime.metrics.register({ name: Constants.WEAVE_ENVIRONMENT_VERSION, type: 'info', description: 'Runtime version' }).set(process.version)
  runtime.metrics.register({ name: Constants.WEAVE_VERSION, type: 'info', description: 'Weave version' }).set(runtime.version)
  runtime.metrics.register({ name: Constants.WEAVE_NODE_ID, type: 'info', description: 'Node ID' }).set(runtime.nodeId)
  runtime.metrics.register({ name: Constants.WEAVE_NAMESPACE, type: 'info', description: 'Namespace in which the node runs.' }).set(runtime.options.namespace)
}
