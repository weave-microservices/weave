/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

/** @module weave */

const { logLevel, loadBalancingStrategy } = require('../constants')

/**
 * Configuration object for weave service broker.
 * @typedef {Object} BulkheadSettings
 * @property {Boolean} enabled Enable bulhead middleware. (default = false)
 * @property {Number} concurrency Maximum concurrent calls. (default = 15)
 * @property {Number} maxQueueSize Maximum queue size. (default = 150)
 */

/**
 * Configuration object for weave service broker.
 * @typedef {Object} RegistrySettings
 * @property {Boolean} preferLocalActions Prefer local actions over remote actions.
 * @property {String|Object} loadBalancingStrategy - Stratagy for the internal load balancer. (default = 'round_robin')
 */

/**
 * Configuration object for weave service broker.
 * @typedef {Object} CircuitBreakerSettings
 * @property {Boolean} enabled Enable circuit breaker middleware. (default = false)
 * @property {Boolean} failureOnError Prefer local actions over remote actions.
 */

/**
 * Configuration object for weave service broker.
 * @typedef {Object} TransportSettings
 * @property {String|Object} adapter Transport adapter.
 * @property {Number} maxQueueSize - Maximum queue size (default = 80000).
 * @property {Number} heartbeatInterval Number of milliseconds in which the heartbeat packet is sent to other nodes. (default = 5000 ms)
 * @property {Number} heartbeatTimeout - Number of milliseconds without response before the node is set to the Not Available status. (default = 10000)
 * @property {Number} offlineNodeCheckInterval - Interval in milliseconds to check and remove not offline nodes. (default = 600000)
 * @property {String|Object} codec Codec settings
 */

/**
 * Middleware object.
 * @typedef {Object} Middleware
 * @property {Function(BrokerInstance)} created Broker created hook.
 * @property {Function(BrokerInstance)} started Broker started hook.
 * @property {Function(BrokerInstance)} stopped Broker stopped hook.
 * @property {Function(BrokerInstance)} serviceCreated Service created hook.
 * @property {Function(BrokerInstance)} serviceStarting Service starting hook.
 * @property {Function(BrokerInstance)} serviceStarted Service started hook.
 * @property {Function(BrokerInstance)} serviceStopping Service stopping hook.
 * @property {Function(BrokerInstance)} serviceStopped Service stopped hook.
 * @property {Function(BrokerInstance)} localAction Local action hook.
 * @property {Function(BrokerInstance)} remoteAction Rremote action hook.
 * @property {Function(BrokerInstance)} createService Create service hook.
 * @property {Function(BrokerInstance)} call Call action hook.
 * @property {Function(BrokerInstance)} emit Emit event hook.
 * @property {Function(BrokerInstance)} broadcast Broadcast event hook.
 */

/**
 * Configuration object for weave service broker.
 * @typedef {Object} BrokerOptions
 * @property {String} nodeId Name of the Service broker node.
 * @property {Boolean|String|Object} cache Indicates whether the Power component is present.
 * @property {Boolean} loadNodeService - Load the $node service. (default = true)
 * @property {Boolean} publishNodeService - Publish the $node service about the transport and make it accessible. (default = false)
 * @property {Boolean} loadInternalMiddlewares - Load the default middlewares on startup. (default = true)
 * @property {Object} logger - Log module. (defualt = console)
 * @property {String} logLevel - Log level of the messages to be displayed.
 * @property {Array<Middleware>} middlewares Custom middlewares.
 * @property {RegistrySettings} registry - Registry settings.
 * @property {CircuitBreakerSettings} circuitBreaker Circuit breaker settings.
 * @property {BulkheadSettings} bulkhead Bulkhead settings.
 * @property {TransportSettings} transport Transport settings.
 * @property {Boolean} watchServices - Monitor services and automatically reload them when changes are made.
 */
module.exports = {
    bulkhead: {
        enabled: false,
        concurrency: 15,
        maxQueueSize: 150
    },
    // cache settings
    cache: false,
    circuitBreaker: {
        enabled: false,
        // Time after which an open circuit breaker is set to half-open.
        halfOpenTimeout: 10000,
        maxFailures: 3,
        windowTime: 60000
    },
    transport: {
        adapter: null,
        // codec for transport serialization/deserialization
        codec: null,
        // maximum queue size
        maxQueueSize: 80000,
        // heartbeat interval
        heartbeatInterval: 5 * 1000,
        // heartbeat timeout
        heartbeatTimeout: 10 * 1000,
        // interval to check and remove not offline nodes.
        offlineNodeCheckInterval: 10 * 60 * 1000
    },
    // load $node service
    loadNodeService: true,
    // load Internal service actions
    publishNodeService: false,
    // log level
    loadInternalMiddlewares: true,
    // broker middelwares
    middlewares: null,
    // activate action statistics
    logger: console,
    // logging class
    logLevel: logLevel.info,
    // metrics settings
    metrics: {
        enabled: false,
        metricRate: 1.0
    },
    // namespace
    namespace: '',
    // Registry settings
    registry: {
        // prefer local services
        preferLocalActions: true,
        // request timeout in ms
        requestTimeout: 0,
        // loadbalancing stategy
        loadBalancingStrategy: loadBalancingStrategy.ROUND_ROBIN
    },
    // retry settings
    retryPolicy: {
        enabled: false,
        delay: 3000,
        retries: 5
    },
    statistics: false,
    // load validation middleware
    validateActionParams: true,
    // reload service on code change
    watchServices: false
}
