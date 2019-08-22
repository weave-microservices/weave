/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = () => {
    function wrapMetricMiddleware (handler, action) {
        const broker = this
        return function metricMiddleware (context) {
            broker.metrics.increment('REQUEST_TOTAL')
            // broker.metrics.increment('REQUEST_IN_FLIGHT')

            return handler(context)
                .then(result => {
                    // broker.metrics.decrement('REQUEST_IN_FLIGHT')
                    return result
                })
                .catch(error => {
                    // broker.metrics.decrement('REQUEST_IN_FLIGHT')
                    // broker.metrics.increment('REQUEST_ERROR_TOTAL')
                    throw error
                })
        }
    }

    return {
        created (t) {
            this.metrics.register({ type: 'counter', name: 'REQUEST_TOTAL' })
            // this.metrics.register({ type: 'gauge', name: 'REQUEST_IN_FLIGHT' })
            // this.metrics.register({ type: 'counter', name: 'REQUEST_ERROR_TOTAL' })
        },
        localAction: wrapMetricMiddleware
    }
}
