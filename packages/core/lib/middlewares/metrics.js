/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
const { Constants } = require('../metrics')

module.exports = () => {
  function wrapMetricMiddleware (handler) {
    const broker = this
    const options = broker.options.metrics || {}

    if (options.enabled) {
      return function metricMiddleware (context) {
        broker.metrics.increment(Constants.REQUESTS_TOTAL)
        broker.metrics.increment(Constants.REQUESTS_IN_FLIGHT)

        return handler(context)
          .then(result => {
            broker.metrics.decrement(Constants.REQUESTS_IN_FLIGHT)
            return result
          })
          .catch(error => {
            broker.metrics.decrement(Constants.REQUESTS_IN_FLIGHT)
            broker.metrics.increment(Constants.REQUESTS_ERRORS_TOTAL)
            throw error
          })
      }
    }
    return handler
  }

  return {
    created () {
      const options = this.options.metrics || {}

      if (options.enabled) {
        // Request metrics
        this.metrics.register({ type: 'counter', name: Constants.REQUESTS_TOTAL, description: 'Number of total requests.' })
        this.metrics.register({ type: 'gauge', name: Constants.REQUESTS_IN_FLIGHT, description: 'Number of running requests.' })
        this.metrics.register({ type: 'counter', name: Constants.REQUESTS_ERRORS_TOTAL, description: 'Number of failed requests.' })

        // Event metrics
        this.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_EMITS, description: 'Number of total emitted events.' })
        this.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_BROADCASTS, description: 'Number of total broadcasted events.' })
        this.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_BROADCASTS_LOCAL, description: 'Number of total local broadcasted events.' })
        this.metrics.register({ type: 'counter', name: Constants.EVENT_TOTAL_RECEIVED, description: 'Number of total received events.' })
      }
    },
    localAction: wrapMetricMiddleware,
    emit (next) {
      return (event, payload) => {
        this.metrics.increment(Constants.EVENT_TOTAL_EMITS)
        return next(event, payload)
      }
    },
    broadcast (next) {
      return (event, payload) => {
        this.metrics.increment(Constants.EVENT_TOTAL_BROADCASTS)
        return next(event, payload)
      }
    },
    broadcastLocal (next) {
      return (event, payload) => {
        this.metrics.increment(Constants.EVENT_TOTAL_BROADCASTS_LOCAL)
        return next(event, payload)
      }
    }
  }
}
