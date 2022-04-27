import { Runtime } from "../runtime/Runtime";
import { Middleware } from "./Middleware";

const Middlewares = require('../middlewares/index');

/**
 * Register middlewares
 * @param {Array<Object>} customMiddlewares Array of user defined middlewares
 * @returns {void}
*/
const registerMiddlewares = (runtime: Runtime, customMiddlewares: Array<Middleware>) => {
  const { middlewareHandler, options, validator, broker } = runtime;

  // Register custom middlewares
  if (Array.isArray(customMiddlewares) && customMiddlewares.length > 0) {
    customMiddlewares.forEach(middleware => middlewareHandler.add(middleware));
  }

  // Add the built-in middlewares. (The order is important)
  if (options.loadInternalMiddlewares) {
    middlewareHandler.add(Middlewares.ActionHooks);

    // Validator middleware
    if (options.validateActionParams && validator) {
      middlewareHandler.add(Middlewares.Validator);
    }

    // Bulkhead
    if (options.bulkhead.enabled) {
      middlewareHandler.add(Middlewares.Bulkhead);
    }

    // Cache
    if (runtime.cache) {
      middlewareHandler.add(Middlewares.Cache);
    }

    // Context tracking
    if (options.contextTracking.enabled) {
      middlewareHandler.add(Middlewares.ContextTracker);
    }

    // Circuit breaker
    if (options.circuitBreaker.enabled) {
      middlewareHandler.add(Middlewares.CircuitBreaker);
    }

    // timeout middleware
    middlewareHandler.add(Middlewares.Timeout);

    // Retry policy
    if (options.retryPolicy.enabled) {
      middlewareHandler.add(Middlewares.Retry);
    }

    // Error handler
    middlewareHandler.add(Middlewares.ErrorHandler);

    // Tracing
    if (options.tracing.enabled) {
      middlewareHandler.add(Middlewares.Tracing);
    }

    // Metrics
    if (options.metrics.enabled) {
      middlewareHandler.add(Middlewares.Metrics);
    }
  }

  // Wrap runtime and broker methods for middlewares
  runtime.actionInvoker.call = middlewareHandler.wrapMethod('call', runtime.actionInvoker.call);
  runtime.actionInvoker.multiCall = middlewareHandler.wrapMethod('multiCall', broker.multiCall);
  runtime.eventBus.emit = middlewareHandler.wrapMethod('emit', runtime.eventBus.emit);
  runtime.eventBus.broadcast = middlewareHandler.wrapMethod('broadcast', runtime.eventBus.broadcast);
  runtime.eventBus.broadcastLocal = middlewareHandler.wrapMethod('broadcastLocal', runtime.eventBus.broadcastLocal);

  // Wrap broker methods
  broker.createService = middlewareHandler.wrapMethod('createService', broker.createService);
  broker.loadService = middlewareHandler.wrapMethod('loadService', broker.loadService);
  broker.loadServices = middlewareHandler.wrapMethod('loadServices', broker.loadServices);
  broker.ping = middlewareHandler.wrapMethod('ping', broker.ping);
};

module.exports = { registerMiddlewares };
