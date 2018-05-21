/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { ROUND_ROBIN, LOG_LEVEL } = require('../../constants')

module.exports = {
    metrics: false, // activate metrics
    metricsRate: 1.0, // metrics rate.
    statistics: false, // activate action statistics
    logger: console, // logging class
    logLevel: LOG_LEVEL.info, // log level
    internalActions: true, // load Internal service actions
    internalActionsAccessable: false,
    preferLocal: true,
    requestTimeout: 0, // request timeout in ms
    validate: true, // load validation middleware
    heartbeatInterval: 5 * 1000, // heartbeat interval
    heartbeatTimeout: 10 * 1000, // heartbeat timeout
    loadBalancingStrategy: ROUND_ROBIN, // loadbalancing stategy
    circuitBreaker: {
        enabled: false,
        maxFailures: 3,
        openTime: 10000, // Time after which an open circuit breaker is set to half-open.
        failureOnTimeout: true,
        failureOnError: true
    }
}
