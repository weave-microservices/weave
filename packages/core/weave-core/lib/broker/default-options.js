/**
 * @typedef {import('../../types.js').BrokerOptions} BrokerOptions
*/

/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
*/

/** @module weave */
const os = require('os')
const { loadBalancingStrategy } = require('../constants')
const { createConsoleLogTransport } = require('../../lib/logger/transports/console')
const defaultFormat = require('../logger/format/default-format')

const isTestEnv = process.env.NODE_ENV === 'test'

/**
 * Returns the default options
 * @returns {BrokerOptions} Broker options
*/
exports.getDefaultOptions = () => {
  // init default formatter for console
  const format = defaultFormat({ displayTimestamp: true, displayBadge: true })
  // default options
  return {
    // If no node id is set - create one.
    nodeId: `${os.hostname()}-${process.pid}`,
    bulkhead: {
      enabled: false,
      concurrentCalls: 15,
      maxQueueSize: 150
    },
    cache: {
      enabled: false,
      adapter: 'memory',
      ttl: 3000
    },
    circuitBreaker: {
      enabled: false,
      halfOpenTimeout: 10000,
      maxFailures: 3,
      windowTime: 60000
    },
    contextTracking: {
      enabled: false,
      shutdownTimeout: 5000
    },
    transport: {
      adapter: null,
      serializer: null,
      maxQueueSize: 80000,
      heartbeatInterval: 5 * 1000,
      nodeUpdateInterval: 5 * 1000,
      heartbeatTimeout: 10 * 1000,
      offlineNodeCheckInterval: 30 * 1000,
      maxOfflineTime: 1000 * 60 * 10,
      maxChunkSize: 256 * 1024
    },
    errorHandler: null,
    loadNodeService: true,
    publishNodeService: false,
    loadInternalMiddlewares: true,
    metrics: {
      enabled: false,
      adapters: [],
      defaultBuckets: [1, 5, 10, 20, 25, 30, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
    },
    middlewares: null,
    logger: {
      enabled: !isTestEnv,
      level: 'info',
      streams: [createConsoleLogTransport({ format })],
      defaultMeta: {}
    },
    tracing: {
      enabled: false,
      samplingRate: 1.0,
      collectors: []
    },
    namespace: '',
    registry: {
      preferLocalActions: true,
      requestTimeout: 0,
      maxCallLevel: 0,
      loadBalancingStrategy: loadBalancingStrategy.ROUND_ROBIN
    },
    retryPolicy: {
      enabled: false,
      delay: 3000,
      retries: 5
    },
    validateActionParams: true,
    watchServices: false
  }
}
