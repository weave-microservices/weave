/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
const endpoint = require('./endpoint')
const { WeaveRequestTimeoutError } = require('../../errors')

const EndpointCircuitBreaker = (state, node, service, action) => {
    const self = endpoint(state, node, service, action)
    const options = state.options.circuitBreaker
    let failureCounter = 0
    let circuitBreakerTimer = null

    self.state = 'CIRCUIT_CLOSED'

    self.isAvailable = () => {
        return self.state === 'CIRCUIT_CLOSED' || self.state === 'CIRCUIT_HALF_OPENED'
    }

    self.failure = (error) => {
        if (error) {
            if (error instanceof WeaveRequestTimeoutError) {
                if (options.failureOnTimeout) {
                    failureCounter++
                }
            } else if (error.code >= 500 && options.failureOnError) {
                failureCounter++
            }

            if (failureCounter >= options.maxFailures) {
                openCircuit()
            }
        }
    }

    self.success = () => {
        if (self.state === 'CIRCUIT_HALF_OPENED') {
            closeCircuit()
        }
    }

    function openCircuit () {
        circuitBreakerTimer = setTimeout(() => {
            halfOpenCircuit()
        }, options.openTime)
        circuitBreakerTimer.unref()

        self.state = 'CIRCUIT_OPENED'
    }

    function halfOpenCircuit () {
        self.state = 'CIRCUIT_HALF_OPENED'
    }

    function closeCircuit () {
        self.state = 'CIRCUIT_CLOSED'
        failureCounter = 0
    }

    return self
}

module.exports = EndpointCircuitBreaker
