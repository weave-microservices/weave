/**
 * @typedef {import('../types.js').Runtime} Runtime
*/

const Constants = require('./constants')

/**
 * @param  {Runtime} runtime Runtime reference
 * @returns {void}
*/
exports.registerCommonMetrics = (runtime) => {
  const { metrics } = runtime

  // Process metrics
  metrics.register({ name: Constants.PROCESS_PID, type: 'info', description: 'Process PID' }).set(process.pid)
  metrics.register({ name: Constants.PROCESS_PPID, type: 'info', description: 'Process parent PID' }).set(process.ppid)
  metrics.register({ name: Constants.PROCESS_UPTIME, type: 'info', description: 'Process uptime' }).set(process.uptime())

  // Weave metrics
  metrics.register({ name: Constants.WEAVE_ENVIRONMENT, type: 'info', description: 'Environment' }).set('Node.js')
  metrics.register({ name: Constants.WEAVE_ENVIRONMENT_VERSION, type: 'info', description: 'Runtime version' }).set(process.version)
  metrics.register({ name: Constants.WEAVE_VERSION, type: 'info', description: 'Weave version' }).set(runtime.version)
  metrics.register({ name: Constants.WEAVE_NODE_ID, type: 'info', description: 'Node ID' }).set(runtime.nodeId)
  metrics.register({ name: Constants.WEAVE_NAMESPACE, type: 'info', description: 'Namespace in which the node runs.' }).set(runtime.options.namespace)
}

/**
 * @param  {Runtime} runtime Runtime reference
 * @returns {void}
*/
exports.updateCommonMetrics = (runtime) => {
  const { metrics } = runtime

  metrics.set(Constants.PROCESS_UPTIME, process.uptime())
}
