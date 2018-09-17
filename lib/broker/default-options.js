/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { ROUND_ROBIN, LOG_LEVEL } = require('../constants')

module.exports = {
    namespace: '',
    cacher: false,
    metrics: {
        enabled: false,
        metricRate: 1.0
    }, // activate metrics
    middlewares: null,
    statistics: false, // activate action statistics
    logger: console, // logging class
    logLevel: LOG_LEVEL.info, // log level
    loadInternalMiddlewares: true,
    internalActions: true, // load Internal service actions
    internalActionsAccessable: false,
    preferLocal: true,
    requestTimeout: 0, // request timeout in ms
    validate: true, // load validation middleware
    heartbeatInterval: 5 * 1000, // heartbeat interval
    heartbeatTimeout: 10 * 1000, // heartbeat timeout
    loadBalancingStrategy: ROUND_ROBIN, // loadbalancing stategy
    watchServices: false,
    retryPolicy: {
        enabled: true,
        retries: 5,
        delay: 3000
    },
    circuitBreaker: {
        enabled: false,
        maxFailures: 3,
        halfOpenTimeout: 10000, // Time after which an open circuit breaker is set to half-open.
        failureOnTimeout: true,
        failureOnError: true
    }
}
