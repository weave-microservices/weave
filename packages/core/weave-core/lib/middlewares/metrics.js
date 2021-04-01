/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
const { Constants } = require('../metrics')

module.exports = (runtime) => {
  function wrapMetricMiddleware (type, action, handler) {
    const options = runtime.options.metrics || {}

    const serviceName = action.service ? action.service.fullyQualifiedName : null
    const actionName = action.name

    if (options.enabled) {
      return function metricMiddleware (context) {
        const callerNodeId = context.callerNodeId

        runtime.metrics.increment(Constants.REQUESTS_TOTAL, { type, serviceName, actionName, callerNodeId })
        runtime.metrics.increment(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId })

        return handler(context)
          .then(result => {
            runtime.metrics.decrement(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId })
            return result
          })
          .catch(error => {
            runtime.metrics.decrement(Constants.REQUESTS_IN_FLIGHT, { type, serviceName, actionName, callerNodeId })
            runtime.metrics.increment(Constants.REQUESTS_ERRORS_TOTAL)
            runtime.handleError(error)
          })
      }
    }
    return handler
  }

  return {
    created () {
      const options = runtime.options.metrics || {}

      if (options.enabled) {
        // Request metrics
        runtime.metrics.register({ type: 'counter', name: Constants.REQUESTS_TOTAL, description: 'Number of total requests.' })
        runtime.metrics.register({ type: 'gauge', name: Constants.REQUESTS_IN_FLIGHT, description: 'Number of running requests.' })
        runtime.metrics.register({ type: 'counter', name: Constants.REQUESTS_ERRORS_TOTAL, description: 'Number of failed requests.' })

        // Event metrics
        runtime.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_EMITS, description: 'Number of total emitted events.' })
        runtime.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_BROADCASTS, description: 'Number of total broadcasted events.' })
        runtime.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_BROADCASTS_LOCAL, description: 'Number of total local broadcasted events.' })
        runtime.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_RECEIVED, description: 'Number of total received events.' })

        // Transport metrics
        runtime.metrics.register({ type: 'gauge', name: Constants.TRANSPORT_IN_FLIGHT_STREAMS, description: 'Number of in flight streams.' })
        runtime.metrics.register({ type: 'counter', name: Constants.TRANSPORTER_PACKETS_SENT, description: 'Number of in flight streams.' })
        runtime.metrics.register({ type: 'counter', name: Constants.TRANSPORTER_PACKETS_RECEIVED, description: 'Number of in flight streams.' })
        runtime.metrics.register({ type: 'gauge', name: Constants.TRANSPORT_IN_FLIGHT_STREAMS, description: 'Number of in flight streams.' })
      }
    },
    localAction (next, action) {
      const options = runtime.options.metrics || {}

      if (options.enabled) {
        return wrapMetricMiddleware.call(runtime, 'local', action, next)
      }

      return next
    },
    remoteAction (next, action) {
      const options = runtime.options.metrics || {}

      if (options.enabled) {
        return wrapMetricMiddleware.call(runtime, 'remote', action, next)
      }

      return next
    },
    emit (next) {
      return (event, payload) => {
        runtime.metrics.increment(Constants.EVENT_TOTAL_EMITS)
        return next(event, payload)
      }
    },
    broadcast (next) {
      return (event, payload) => {
        runtime.metrics.increment(Constants.EVENT_TOTAL_BROADCASTS)
        return next(event, payload)
      }
    },
    broadcastLocal (next) {
      return (event, payload) => {
        runtime.metrics.increment(Constants.EVENT_TOTAL_BROADCASTS_LOCAL)
        return next(event, payload)
      }
    }
  }
}
