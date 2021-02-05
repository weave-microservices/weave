/**
 * @typedef {import('../../types.js').BrokerOptions} BrokerOptions
*/

/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
*/

/** @module weave */

const { loadBalancingStrategy } = require('../constants')

/**
 * Return the default options
 * @returns {BrokerOptions} Broker options
 */
exports.getDefaultOptions = () => ({
  bulkhead: {
    enabled: false,
    concurrentCalls: 15,
    maxQueueSize: 150
  },
  // cache settings
  cache: {
    enabled: false,
    adapter: 'memory',
    ttl: 3000
  },
  circuitBreaker: {
    enabled: false,
    // Time after which an open circuit breaker is set to half-open.
    halfOpenTimeout: 10000,
    maxFailures: 3,
    windowTime: 60000
  },
  transport: {
    adapter: null,
    // serializer for transport serialization/deserialization
    serializer: null,
    // maximum queue size
    maxQueueSize: 80000,
    // heartbeat interval
    heartbeatInterval: 5 * 1000,
    // local node update interval
    nodeUpdateInterval: 5 * 1000,
    // heartbeat timeout
    heartbeatTimeout: 10 * 1000,
    // interval to check and remove not offline nodes.
    offlineNodeCheckInterval: 30 * 1000,
    // Maximum time a node can be offline before it is removed from the registry.
    maxOfflineTime: 1000 * 60 * 10,
    // Maximum chunk size for stream chunks
    maxChunkSize: 256 * 1024
  },
  errorHandler: null,
  // load $node service
  loadNodeService: true,
  // load Internal service actions
  publishNodeService: false,
  // log level
  loadInternalMiddlewares: true,
  metrics: {
    enabled: false,
    adapters: [],
    defaultBuckets: [1, 5, 10, 20, 25, 30, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
  },
  // broker middelwares
  middlewares: null,
  // activate action statistics
  logger: {
    enabled: true,
    logLevel: 'info',
    stream: process.stdout,
    displayTimestamp: true,
    displayBadge: true,
    displayLabel: true,
    displayModuleName: true,
    displayFilename: false
  },
  // metrics settings
  tracing: {
    enabled: false,
    samplingRate: 1.0,
    collectors: []
  },
  // namespace
  namespace: '',
  // Registry settings
  registry: {
    // prefer local services
    preferLocalActions: true,
    // request timeout in ms
    requestTimeout: 0,
    // maximum request level
    maxCallLevel: 0,
    // loadbalancing stategy
    loadBalancingStrategy: loadBalancingStrategy.ROUND_ROBIN
  },
  // retry settings
  retryPolicy: {
    enabled: false,
    delay: 3000,
    retries: 5
  },
  // load validation middleware
  validateActionParams: true,
  // reload service on code change
  watchServices: false
})
