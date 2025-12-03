/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

/**
 * Built-in middleware implementations for cross-cutting concerns
 *
 * Middlewares provide reusable functionality that can be applied to actions and events:
 * - ActionHooks: Before/after/error hooks for actions
 * - Bulkhead: Concurrency limiting and isolation
 * - Cache: Response caching and invalidation
 * - CircuitBreaker: Circuit breaker pattern for fault tolerance
 * - ErrorHandler: Centralized error processing
 * - Metrics: Performance monitoring and collection
 * - Tracing: Distributed tracing support
 * - Retry: Automatic retry with backoff strategies
 * - Timeout: Request timeout handling
 * - ContextTracker: Context lifecycle tracking
 * - Validator: Parameter validation middleware
 *
 * @namespace Middlewares
 */
import ActionHooks from './action-hooks/index.mts';
import Bulkhead from './bulkhead/index.mts';
import Cache from './cache/index.mts';
import CircuitBreaker from './circuit-breaker/index.mts';
import ErrorHandler from './error-handler/index.mts';
import Metrics from './metrics/index.mts';
import Tracing from './tracing/index.mts';
import Retry from './retry/index.mts';
import Timeout from './timeout/index.mts';
import ContextTracker from './context-tracker/index.mts';
import Validator from './validator/index.mts';
import ContractGenerator from './contract-generator/index.mts';

export {
  ActionHooks,
  Bulkhead,
  Cache,
  CircuitBreaker,
  ErrorHandler,
  Metrics,
  Tracing,
  Retry,
  Timeout,
  ContextTracker,
  Validator,
  ContractGenerator,
};
