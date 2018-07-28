module.exports = () => {
    // let log = null
    let circuitBreakerTimer = null

    function createWindowTimer (windowTime) {
        circuitBreakerTimer = setInterval(() => clearEndpointStore(), (windowTime || 6000))
        circuitBreakerTimer.unref()
    }

    function clearEndpointStore () {

    }

    function wrapCircuitBreakerMiddleware (handler, action) {
        // const self = this
        return function curcuitBreakerMiddleware (context) {
            return handler(context)
        }
    }

    return {
        brokerCreated () {
            // log = this.getLogger('circuit-breaker')
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
