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
module.exports = {
  ActionHooks: require('./action-hooks'),
  Bulkhead: require('./bulkhead'),
  Cache: require('./cache'),
  CircuitBreaker: require('./circuit-breaker'),
  ErrorHandler: require('./error-handler'),
  Metrics: require('./metrics'),
  Tracing: require('./tracing'),
  Retry: require('./retry'),
  Timeout: require('./timeout'),
  ContextTracker: require('./context-tracker'),
  Validator: require('./validator')
};
