module.exports = () => {
    let log = null
    let circuitBreakerTimer = null
    const storage = new Map()

    function createWindowTimer (windowTime) {
        circuitBreakerTimer = setInterval(() => clearEndpointStore(), (windowTime || 6000))
        circuitBreakerTimer.unref()
    }

    function clearEndpointStore () {
        storage.forEach(item => {
            if (item.callCounter === 0) {
                storage.delete(item.name)
                return
            }
        })
    }

    function getEndpointState (endpoint, options) {
        let item = storage.get(endpoint.name)
        if (!item) {
            item = {
                endpoint,
                options,
                callCounter: 0,
                failureCouter: 0,
                state: 'CIRCUIT_BREAKER_CLOSED',
                circuitBreakerTimer: null
            }
            storage.set(endpoint.name, item)
        }
        return item
    }

    function success (item, options) {
        item.callCounter++

        if (item.state === 'CIRCUIT_BREAKER_HALF_OPENED') {
            closeCircuitBreaker(item)
        } else {
            checkThreshold(item, options)
        }
    }

    function failure (item, error, options) {
        item.callCounter++
        item.failureCouter++
        checkThreshold(item, options)
    }

    function checkThreshold (item, options) {
        if (item.failureCouter >= options.maxFailures) {
            openCircuitBreaker(item)
        }
    }

    function openCircuitBreaker (item) {
        item.state = 'CIRCUIT_BREAKER_OPEN'
        item.endpoint.state = false
        item.circuitBreakerTimer = setTimeout(() => halfOpenCircuitBreaker(item), item.options.halfOpenTimeout)
        log.debug(`Circuit breaker has been opened for endpoint '${item.endpoint.name}'`)
    }

    function halfOpenCircuitBreaker (item) {
        item.state = 'CIRCUIT_BREAKER_HALF_OPEN'
        item.endpoint.state = true
        log.debug(`Circuit breaker has been half opened for endpoint '${item.endpoint.name}'`)
    }

    function closeCircuitBreaker (item, options) {
        item.failureCouter = 0
        item.callCounter = 0
        item.state = 'CIRCUIT_BREAKER_CLOSED'
        item.endpoint.state = true
        if (item.circuitBreakerTimer) {
            clearTimeout(item.circuitBreakerTimer)
            item.circuitBreakerTimer = null
        }
        log.debug(`Circuit breaker has been closed for endpoint '${item.endpoint.name}'`)
    }

    function wrapCircuitBreakerMiddleware (handler, action) {
        const self = this
        const options = Object.assign({}, self.options.circuitBreaker, action.circuitBreaker || {})
        if (options.enabled) {
            return function curcuitBreakerMiddleware (context) {
                const endpoint = context.endpoint
                const item = getEndpointState(endpoint, options)

                return handler(context)
                    .then(result => {
                        const item = getEndpointState(endpoint, options)
                        success(item, options)
                        return result
                    })
                    .catch(error => {
                        failure(item, error, options)
                        return Promise.reject(error)
                    })
            }
        }
        return handler
    }

    return {
        brokerCreated () {
            log = this.getLogger('circuit-breaker')
            const options = this.state.options.circuitBreaker
            if (options.enabled) {
                createWindowTimer(options.windowTime)
            }
        },
        localAction: wrapCircuitBreakerMiddleware,
        remoteAction: wrapCircuitBreakerMiddleware,
        brokerStopped () {
            clearInterval(circuitBreakerTimer)
        }
    }
}

//    self.isAvailable = () => {
//         return self.state === 'CIRCUIT_CLOSED' || self.state === 'CIRCUIT_HALF_OPENED'
//     }

// function failure (error) {
//         if (error) {
//             if (error instanceof WeaveRequestTimeoutError) {
//                 if (options.failureOnTimeout) {
//                     failureCounter++
//                 }
//             } else if (error.code >= 500 && options.failureOnError) {
//                 failureCounter++
//             }

//             if (failureCounter >= options.maxFailures) {
//                 openCircuit()
//             }
//         }
//     }

// function success() {
//         if (self.state === 'CIRCUIT_HALF_OPENED') {
//             closeCircuit()
//         }
//     }

// function openCircuit () {
//     circuitBreakerTimer = setTimeout(() => {
//         halfOpenCircuit()
//     }, options.openTime)
//     circuitBreakerTimer.unref()

//     self.state = 'CIRCUIT_OPENED'
// }

// function halfOpenCircuit () {
//     self.state = 'CIRCUIT_HALF_OPENED'
// }

// function closeCircuit () {
//     self.state = 'CIRCUIT_CLOSED'
//     failureCounter = 0
// }

// const wrapMetricsMiddleware = function (handler, action) {
//     const internal = this
//     const options = internal.options.metrics || {}

//     if (options.enabled) {
//         return context => {
//             if (context.metrics === null) {
//                 context.metrics = shouldCollectMetrics(internal.state, options)
//             }
//             if (context.metrics) {
//                 metricsStart(internal, context)
//                 return handler(context)
//                     .then(result => {
//                         metricsFinish(internal, context)
//                         return result
//                     })
//                     .catch(error => {
//                         metricsFinish(internal, context, error)
//                         return Promise.reject(error)
//                     })
//             }
//             return handler(context)
//         }
//     }
//     return handler
// }
