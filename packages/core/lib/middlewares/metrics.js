/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
const { Constants } = require('../metrics')

module.exports = () => {
    function wrapMetricMiddleware (handler, action) {
        const broker = this
        return function metricMiddleware (context) {
            broker.metrics.increment(Constants.WEAVE_REQUESTS_TOTAL)
            broker.metrics.increment(Constants.WEAVE_REQUESTS_IN_FLIGHT)

            return handler(context)
                .then(result => {
                    broker.metrics.decrement(Constants.WEAVE_REQUESTS_IN_FLIGHT)
                    return result
                })
                .catch(error => {
                    broker.metrics.decrement(Constants.WEAVE_REQUESTS_IN_FLIGHT)
                    broker.metrics.increment(Constants.WEAVE_REQUESTS_ERRORS_TOTAL)
                    throw error
                })
        }
    }

    return {
        created (t) {
            this.metrics.register({ type: 'counter', name: Constants.WEAVE_REQUESTS_TOTAL, description: 'Number of total requests.' })
            this.metrics.register({ type: 'gauge', name: Constants.WEAVE_REQUESTS_IN_FLIGHT, description: 'Number of running requests.' })
            this.metrics.register({ type: 'counter', name: Constants.WEAVE_REQUESTS_ERRORS_TOTAL, description: 'Number of failed requests.' })
        },
        localAction: wrapMetricMiddleware
    }
}
