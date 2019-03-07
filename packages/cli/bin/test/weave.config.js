module.exports = {
    // namespace: 'dev',
    nodeId: 'my-first-node',
    logLevel: 'info',
    transporter: 'Redis',
    middlewares: null,
    requestTimeout: 0 * 1000,
    heartbeatInterval: 5000,
    heartbeatTimeout: 1500,
    loadBalancingStrategy: 'round_robin',
    circuitBreaker: {
        enabled: false,
        maxFailures: 3,
        halfOpenTimeout: 10000,
        failureOnTimeout: true,
        failureOnError: true
    },
    validation: true,
    metrics: {
        enabled: false,
        metricRate: 1.0
    },
    retryPolicy: {
        enabled: false,
        retries: 5,
        delay: 3000
    },
    metricsRate: 1,
    internalActions: true,
    internalActionsAccessable: false,
    watchServices: false
}
