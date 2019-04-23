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
 * @typedef {Object} MetricsSettings
 * @property {Boolean} enabled Enable bulhead middleware. (default = false)
 * @property {Number} metricsRate Rate of metrics calls. (default = 1.0)
 */

/**
 * Configuration object for weave service broker.
 * @typedef {Object} RegistrySettings
 * @property {Boolean} preferLocalActions Prefer local actions over remote actions. (default = true)
 * @property {Number} requestTimeout Time in milliseconds after which a request is rejected. (default = 0)
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
 * @typedef {Object} RetryPolicySettings
 * @property {Boolean} enabled Enable circuit breaker middleware. (default = false)
 * @property {Number} delay Delay in milliseconds before the next call is attempted. (default = 3000)
 * @property {Number} retries Number of attempts before the action call gets rejected. (default = 5)
 */

/**
 * Configuration object for weave service broker.
 * @typedef {Object} TransportSettings
 * @property {String|Object} adapter Transport adapter.
 * @property {Number} maxQueueSize Maximum queue size (default = 80000).
 * @property {Number} heartbeatInterval Number of milliseconds in which the heartbeat packet is sent to other nodes. (default = 5000 ms)
 * @property {Number} heartbeatTimeout Number of milliseconds without response before the node is set to the Not Available status. (default = 10000)
 * @property {Number} offlineNodeCheckInterval Interval in milliseconds to check and remove not offline nodes. (default = 30000)
 * @property {Number} maxOfflineTime Maximum time a node can be offline before it is removed from the registry. (default = 600000)
 * @property {String|Object} codec Codec settings
 */

/**
 * Configuration object for logger.
 * @typedef {Object} LoggerSettings
 * @property {Boolean} enabled Enable logger.
 * @property {Stream.Writable|Array} stream Destination to which the data is written, can be a single valid Writable stream or an array holding multiple valid Writable streams. (default = process.stdout).
 * @property {Boolean} showTimestamp Show the current timestamp. (default = true)
 * @property {Boolean} showBadge Show log type badge. (default = true)
 * @property {Boolean} showLabel Show log type label. (default = true)
 * @property {Boolean} showModuleName Show the module name. (default = true)
 * @property {Object} types Custom log types.
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
 * @property {Boolean} loadNodeService Load the $node service. (default = true)
 * @property {Boolean} publishNodeService Publish the $node service about the transport and make it accessible. (default = false)
 * @property {Boolean} loadInternalMiddlewares - Load the default middlewares on startup. (default = true)
 * @property {LoggerSettings} logger Logger settings.
 * @property {'fatal'|'error'|'warn'|'info'|'debug'|'trace'} logLevel Log level of the messages to be displayed.
 * @property {MetricsSettings} metrics Metrics settings
 * @property {Array<Middleware>} middlewares Custom middlewares (default = null).
 * @property {RegistrySettings} registry - Registry settings.
 * @property {RetryPolicySettings} retryPolicy - Retry policy
 * @property {CircuitBreakerSettings} circuitBreaker Circuit breaker settings.
 * @property {BulkheadSettings} bulkhead Bulkhead settings.
 * @property {TransportSettings} transport Transport settings.
 * @property {Boolean} watchServices Monitor services and automatically reload them when changes are made.
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
        offlineNodeCheckInterval: 30 * 1000,
        // Maximum time a node can be offline before it is removed from the registry.
        maxOfflineTime: 1000 * 60 * 10
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
    logger: {
        enabled: true,
        stream: process.stdout,
        showTimestamp: true,
        showBadge: true,
        showLabel: true,
        showModuleName: true
    },
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
