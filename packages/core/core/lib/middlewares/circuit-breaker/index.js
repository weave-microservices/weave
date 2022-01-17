/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */
const {
  CIRCUIT_CLOSED,
  CIRCUIT_HALF_OPENED,
  CIRCUIT_HALF_OPEN_WAITING,
  CIRCUIT_OPENED
} = require('../../constants').circuitBreakerStates

module.exports = (runtime) => {
  const storage = new Map()
  let log = null
  let circuitBreakerTimer = null

  function createWindowTimer (windowTime) {
    circuitBreakerTimer = setInterval(() => clearEndpointStore(), windowTime)
    circuitBreakerTimer.unref()
  }

  function clearEndpointStore () {
    storage.forEach((item) => {
      if (item.callCounter === 0) {
        storage.delete(item.name)
        return
      }

      item.callCounter = 0
      item.failureCouter = 0
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
        state: CIRCUIT_CLOSED,
        circuitBreakerTimer: null
      }
      storage.set(endpoint.name, item)
    }

    return item
  }

  function onSuccess (item, options) {
    item.callCounter++

    if (item.state === CIRCUIT_HALF_OPENED) {
      closeCircuitBreaker(item)
    } else {
      checkThreshold(item, options)
    }
  }

  function onFailure (item, options) {
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
    item.state = CIRCUIT_OPENED
    item.endpoint.state = false
    item.circuitBreakerTimer = setTimeout(() => halfOpenCircuitBreaker(item), item.options.halfOpenTimeout)
    item.circuitBreakerTimer.unref()
    log.debug(`Circuit breaker has been opened for endpoint '${item.endpoint.name}'`)
  }

  function halfOpenCircuitBreaker (item) {
    item.state = CIRCUIT_HALF_OPENED
    item.endpoint.state = true

    log.debug(`Circuit breaker has been half opened for endpoint '${item.endpoint.name}'`)

    if (item.circuitBreakerTimer) {
      clearTimeout(item.circuitBreakerTimer)
      item.circuitBreakerTimer = null
    }
  }

  function handleHalfOpen (item) {
    item.state = CIRCUIT_HALF_OPEN_WAITING
    item.endpoint.state = false
    item.circuitBreakerTimer = setTimeout(() => halfOpenCircuitBreaker(item), item.options.halfOpenTimeout)
    item.circuitBreakerTimer.unref()
  }

  function closeCircuitBreaker (item) {
    item.failureCouter = 0
    item.callCounter = 0
    item.state = CIRCUIT_CLOSED
    item.endpoint.state = true

    if (item.circuitBreakerTimer) {
      clearTimeout(item.circuitBreakerTimer)
      item.circuitBreakerTimer = null
    }

    log.debug(`Circuit breaker has been closed for endpoint '${item.endpoint.name}'`)
  }

  function wrapCircuitBreakerMiddleware (handler, action) {
    const options = Object.assign({}, runtime.options.circuitBreaker, action.circuitBreaker || {})

    if (options.enabled) {
      return function curcuitBreakerMiddleware (context, serviceInjections) {
        const endpoint = context.endpoint
        const item = getEndpointState(endpoint, options)

        // handle half open states
        if (item.state === CIRCUIT_HALF_OPENED) {
          handleHalfOpen(item, context)
        }

        return handler(context, serviceInjections)
          .then(result => {
            const item = getEndpointState(endpoint, options)
            onSuccess(item, options)

            return result
          })
          .catch(error => {
            if (item && (!error.nodeId || error.nodeId === context.nodeId)) {
              onFailure(item, options)
            }

            return Promise.reject(error)
          })
      }
    }
    return handler
  }

  return {
    created () {
      log = runtime.createLogger('circuit-breaker')

      if (runtime.options.metrics.enabled) {
        // todo: add circuit breaker metrics
      }
    },
    started () {
      const { enabled, windowTime } = this.options.circuitBreaker
      if (enabled) {
        createWindowTimer(windowTime)
      }
    },
    localAction: wrapCircuitBreakerMiddleware,
    remoteAction: wrapCircuitBreakerMiddleware,
    brokerStopped () {
      clearInterval(circuitBreakerTimer)
    }
  }
}
