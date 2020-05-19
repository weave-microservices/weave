const { Constants } = require('../metrics')

module.exports = function registerMetrics (broker) {
  if (broker.metrics) {
    broker.metrics.register({ name: Constants.WEAVE_ENVIRONMENT, type: 'info', description: 'Node environment.' }).set('nodejs')
    broker.metrics.register({ name: Constants.WEAVE_VERSION, type: 'info', description: 'Node environment.' }).set(broker.version)
    broker.metrics.register({ name: Constants.WEAVE_VERSION, type: 'info', description: 'Node environment.' }).set(broker.nodeId)
    broker.metrics.register({ name: Constants.WEAVE_VERSION, type: 'info', description: 'Node environment.' }).set(broker.namespace)
  }
}
