/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

import os from 'os';
import { createInMemoryCache } from '../cache/adapters/inMemory.js'
import { loadBalancingStrategy } from '../constants.js';

export type BrokerOptions = {
  nodeId: string,
  namespace?: string,
  bulkhead?: BulkheadOptions,
  cache?: CacheOptions,
  circuitBreaker?: CircuitBreakerOptions,
  contextTracking?: ContextTrackingOptions,
  transport?: TransporterOptions,
  errorHandler?: GlobalErrorHandler,
  loadInternalMiddlewares?: boolean,
  metrics?: MetricsOptions,
  middlewares?: Middleware[],
  logger?: LoggerOptions,
  tracing?: TracingOptions,
  registry?: RegistryOptions,
  retryPolicy?: RetryPolicyOptions,
  validateActionParams: boolean,
  validatorOptions: ValidatorOptions
}

export type BulkheadOptions = {
  enabled: boolean,
  concurrentCalls?: number,
  maxQueueSize?: number
}

export type CacheAdapter = any;

export type TransportAdapter = any;

export type MetricsExporter = any;

export type TracingExporter = any;

export type CacheOptions = {
  enabled: boolean,
  concurrentCalls?: number,
  maxQueueSize?: number,
  adapter?: CacheAdapter,
  ttl?: number,
  lock?: {
    enabled?: boolean
  }
}

export type CircuitBreakerOptions = {
  enabled: boolean,
  halfOpenTimeout?: number,
  maxFailures?: number,
  windowTime?: number
}

export type ContextTrackingOptions = {
  enabled?: boolean,
  shutdownTimeout?: number
}

export type TransporterOptions = {
  adapter?: TransportAdapter | null,
  maxQueueSize?: number,
  heartbeatInterval?: number,
  localNodeUpdateInterval?: number,
  heartbeatTimeout: number,
  offlineNodeCheckInterval: number,
  maxOfflineTime: number,
  maxChunkSize: number,
  streams?: {
    handleBackpressure: boolean
  }
}

export type GlobalErrorHandler = (error: Error) => void;

export type MetricsOptions = {
  enabled: boolean,
  collectCommonMetrics: boolean,
  collectInterval: number,
  adapters: MetricsExporter[],
  defaultBuckets: number[]
}

export type LogLevel = 'info' | 'debug'

export type LoggerOptions = {
  enabled: boolean,
  level: LogLevel,
  base?: Record<string, any> 
}

export type TracingActionOptions = {
  data: boolean,
  response: boolean,
  tags: Record<string, string>
}

export type TracingEventOptions = {
  data: boolean,
  tags: Record<string, string>
}

export type TracingErrorOptions = {
  fields: string[],
  stackTrace: boolean
}

export type TracingOptions = {
  enabled: boolean,
  samplingRate: number,
  collectors: TracingExporter[],
  actions?: TracingActionOptions,
  events?: TracingEventOptions,
  errors?: TracingErrorOptions
}

export type RegistryOptions = {
  preferLocalActions: boolean,
  requestTimeout: number,
  publishNodeService: boolean,
  maxCallLevel: number,
  loadBalancingStrategy: string // todo -> enum
}

export type RetryPolicyOptions = {
  enabled?: boolean,
  delay: number,
  retries: number
}

export type ValidatorStrictModeOptions = 'remove' | 'error';

export type ValidatorOptions = {
  strict: boolean,
  strictMode: ValidatorStrictModeOptions // 'error'
}

export type Middleware = {}

export const getDefaultOptions = (): BrokerOptions => {
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
    errorHandler: null,
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
