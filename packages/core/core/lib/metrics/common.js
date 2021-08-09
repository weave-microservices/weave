/**
 * @typedef {import('../types.js').Runtime} Runtime
*/
const os = require('os')
const Constants = require('./constants')

const getUserInfo = () => {
  try {
    return os.userInfo()
  } catch (e) {
    return {}
  }
}

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

  // OS Metrics
  metrics.register({ name: Constants.OS_HOSTNAME, type: 'info', description: 'Hostname' }).set(os.hostname())
  metrics.register({ name: Constants.OS_TYPE, type: 'info', description: 'OS type' }).set(os.type())
  metrics.register({ name: Constants.OS_RELEASE, type: 'info', description: 'OS release' }).set(os.release())
  metrics.register({ name: Constants.OS_ARCH, type: 'info', description: 'OS architecture' }).set(os.arch())
  metrics.register({ name: Constants.OS_PLATTFORM, type: 'info', description: 'OS plattform' }).set(os.platform())
  metrics.register({ name: Constants.OS_MEMORY_TOTAL, type: 'gauge', description: 'OS free memory' })
  metrics.register({ name: Constants.OS_MEMORY_USED, type: 'gauge', description: 'OS memory used' })
  metrics.register({ name: Constants.OS_MEMORY_FREE, type: 'gauge', description: 'OS memory free' })
  metrics.register({ name: Constants.OS_UPTIME, type: 'gauge', description: 'OS uptime' }).set(os.uptime())

  metrics.register({ name: Constants.OS_CPU_LOAD_1, type: 'gauge', description: 'OS CPU load 1' })
  metrics.register({ name: Constants.OS_CPU_LOAD_5, type: 'gauge', description: 'OS CPU load 5' })
  metrics.register({ name: Constants.OS_CPU_LOAD_15, type: 'gauge', description: 'OS CPU load 15' })

  const userInfo = getUserInfo()
  metrics.register({ name: Constants.OS_USER_UID, type: 'info', description: 'User UID' }).set(userInfo.uid)
  metrics.register({ name: Constants.OS_USER_GID, type: 'info', description: 'User GID' }).set(userInfo.gid)
  metrics.register({ name: Constants.OS_USER_USERNAME, type: 'info', description: 'Username' }).set(userInfo.username)
  metrics.register({ name: Constants.OS_USER_HOMEDIR, type: 'info', description: 'User home directory' }).set(userInfo.homedir)
}

/**
 * @param  {Runtime} runtime Runtime reference
 * @returns {void}
*/
exports.updateCommonMetrics = (runtime) => {
  const { metrics } = runtime

  metrics.set(Constants.PROCESS_UPTIME, process.uptime())
  const freeMemory = os.freemem()
  const totalMemory = os.totalmem()
  const usedMemory = totalMemory - freeMemory

  metrics.set(Constants.OS_RELEASE, os.release())
  metrics.set(Constants.OS_MEMORY_TOTAL, totalMemory)
  metrics.set(Constants.OS_MEMORY_USED, usedMemory)
  metrics.set(Constants.OS_MEMORY_FREE, freeMemory)
  metrics.set(Constants.OS_UPTIME, os.uptime())

  const load = os.loadavg()
  metrics.set(Constants.OS_CPU_LOAD_1, load[0])
  metrics.set(Constants.OS_CPU_LOAD_5, load[1])
  metrics.set(Constants.OS_CPU_LOAD_15, load[2])
}
