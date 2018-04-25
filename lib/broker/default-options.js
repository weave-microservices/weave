/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { ROUND_ROBIN } = require('../../constants')

module.exports = {
    metrics: false, // activate metrics
    metricsRate: 1.0, // metrics rate.
    statistics: false, // activate action statistics
    logger: console,
    logLevel: 'info',
    internalActions: true, // load Internal service actions
    internalActionsAccessable: false,
    preferLocal: false,
    requestTimeout: 0, // request timeout in ms
    validate: true, // load validation middleware
    heartbeatInterval: 5 * 1000, // heartbeat interval
    heartbeatTimeout: 10 * 1000, // heartbeat timeout
    loadBalancingStrategy: ROUND_ROBIN, // loadbalancing stategy
    circuitBreaker: {
        enabled: false,
        maxFailures: 3,
        failureOnTimeout: true,
        failureOnReject: true
    }
}
