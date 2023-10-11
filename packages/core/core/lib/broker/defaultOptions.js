/**
 * @typedef {import('../types.js').BrokerOptions} BrokerOptions
*/

/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

/** @module weave */
const os = require('os');
const { createInMemoryCache } = require('../cache/adapters/inMemory.js');
const { loadBalancingStrategy } = require('../constants');

/**
 * Returns the default options
 * @returns {BrokerOptions} Broker options
*/
exports.getDefaultOptions = () => {
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
      adapter: createInMemoryCache(),
      ttl: 3000,
      lock: {
        enabled: false
      }
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
      maxQueueSize: 80000,
      heartbeatInterval: 5 * 1000,
      localNodeUpdateInterval: 5 * 1000,
      heartbeatTimeout: 10 * 1000,
      offlineNodeCheckInterval: 30 * 1000,
      maxOfflineTime: 1000 * 60 * 10,
      maxChunkSize: 256 * 1024,
      streams: {
        handleBackpressure: true
      }
    },
    errorHandler: undefined,
    loadInternalMiddlewares: true,
    metrics: {
      enabled: false,
      collectCommonMetrics: true,
      collectInterval: 5000,
      adapters: [],
      defaultBuckets: [1, 5, 10, 20, 25, 30, 40, 50, 100, 250, 500, 1000, 2500, 5000, 10000]
    },
    middlewares: [],
    logger: {
      enabled: true,
      level: 'info',
      base: {
        pid: process.pid,
        hostname: os.hostname()
      }
    },
    tracing: {
      enabled: false,
      samplingRate: 1.0,
      collectors: [],
      defaultTags: {},
      actions: {
        data: false,
        response: false,
        tags: {}
      },
      events: {
        data: false,
        tags: {}
      },
      errors: {
        fields: ['name', 'message', 'code', 'type', 'data'],
        stackTrace: false
      }
    },
    namespace: '',
    registry: {
      preferLocalActions: true,
      requestTimeout: 0,
      publishNodeService: false,
      maxCallLevel: 0,
      loadBalancingStrategy: loadBalancingStrategy.ROUND_ROBIN
    },
    retryPolicy: {
      enabled: false,
      delay: 3000,
      retries: 5
    },
    validateActionParams: true,
    validatorOptions: {
      strict: true,
      strictMode: 'remove' // 'error'
    }
  };
};
