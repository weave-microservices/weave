const { Constants } = require('../../metrics')

module.exports.getMiddlewareWrapper = (runtime) => function (type, action, handler) {
  const serviceName = action.service ? action.service.fullyQualifiedName : null
  const actionName = action.name

  return function metricMiddleware (context, serviceInjections) {
    const callerNodeId = context.callerNodeId

    runtime.metrics.increment(Constants.REQUESTS_TOTAL, { type, serviceName, actionName, callerNodeId })
    runtime.metrics.increment(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId })
    const requestEnd = runtime.metrics.timer(Constants.REQUESTS_TIME, { type, serviceName, actionName, callerNodeId })

    return handler(context, serviceInjections)
      .then(result => {
        requestEnd()
        runtime.metrics.decrement(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId })
        return result
      })
      .catch(error => {
        requestEnd()
        runtime.metrics.decrement(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId })
        runtime.metrics.increment(Constants.REQUESTS_ERRORS_TOTAL)
        runtime.handleError(error)
      })
  }
}
