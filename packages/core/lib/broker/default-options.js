/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { ROUND_ROBIN, LOG_LEVEL } = require('../constants')

module.exports = {
    // cache settimngs
    cache: false,
    circuitBreaker: {
        enabled: false,
        failureOnError: true,
        // Time after which an open circuit breaker is set to half-open.
        failureOnTimeout: true,
        halfOpenTimeout: 10000,
        maxFailures: 3
    },
    // codec for transport serialization/deserialization
    codec: null,
    // heartbeat interval
    heartbeatInterval: 5 * 1000,
    // heartbeat timeout
    heartbeatTimeout: 10 * 1000,
    internalActions: true,
    // load Internal service actions
    internalActionsAccessable: false,
    // loadbalancing stategy
    loadBalancingStrategy: ROUND_ROBIN,
    // log level
    loadInternalMiddlewares: true,
    // activate action statistics
    logger: console,
    // logging class
    logLevel: LOG_LEVEL.info,
    // metrics settings
    metrics: {
        enabled: false,
        metricRate: 1.0
    },
    // broker middelwares
    middlewares: null,
    // namespace
    namespace: '',
    // prefer local services
    preferLocal: true,
    // request timeout in ms
    requestTimeout: 0,
    // retry settings
    retryPolicy: {
        delay: 3000,
        enabled: false,
        retries: 5
    },
    statistics: false,
    // load validation middleware
    validate: true,
    // reload service on code change
    watchServices: false
}
