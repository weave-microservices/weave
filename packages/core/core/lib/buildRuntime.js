const { initLogger } = require('./runtime/initLogger');
const { initMiddlewareHandler } = require('./runtime/initMiddlewareManager');
const { initRegistry } = require('./runtime/initRegistry');
const { initContextFactory } = require('./runtime/initContextFactory');
const { initEventbus } = require('./runtime/initEventbus');
const { initValidator } = require('./runtime/initValidator');
const { initTransport } = require('./runtime/initTransport');
const { initCache } = require('./runtime/initCache');
const { initActionInvoker } = require('./runtime/initActionInvoker');
const { initServiceManager } = require('./runtime/initServiceManager');
const { initMetrics } = require('./runtime/initMetrics');
const { initTracer } = require('./runtime/initTracing');
const { initUUIDFactory } = require('./runtime/initUuidFactory');
const { errorHandler, fatalErrorHandler } = require('./errorHandler');
const { uuid } = require('@weave-js/utils');
const { version } = require('../package.json');
const EventEmitter = require('eventemitter2');

/**
 * Initializes and builds the complete Weave runtime with all core components
 *
 * The runtime contains all the core subsystems needed for a Weave broker:
 * - Logger: Configurable logging system
 * - Middleware: Request/response processing pipeline
 * - Registry: Service discovery and load balancing
 * - Context Factory: Request context creation
 * - Event Bus: Pub/sub messaging system
 * - Transport: Network communication layer
 * - Cache: Distributed caching
 * - Metrics: Performance monitoring
 * - Tracing: Distributed tracing
 *
 * @param {import('../types').BrokerOptions} options - Broker configuration options
 * @returns {import('../types').Runtime} Fully initialized runtime instance
 * @example
 * const runtime = initRuntime({
 *   nodeId: 'my-service',
 *   logger: { level: 'info' },
 *   transport: { adapter: 'TCP' }
 * });
 */
exports.initRuntime = (options) => {
  /**
   * Internal event bus for broker communication
   * Supports wildcard patterns and high listener count for complex service topologies
   * @type {EventEmitter}
   */
  const bus = new EventEmitter({
    wildcard: true,
    maxListeners: 1000
  });

  /**
   * Core runtime object containing all initialized subsystems
   * @type {import('../types').Runtime}
   */
  const runtime = {
    nodeId: options.nodeId,
    version,
    options,
    bus,
    state: {
      instanceId: uuid(),
      isStarted: false
    },
    handleError: (error) => errorHandler(runtime, error),
    fatalError: (message, error, killProcess) => fatalErrorHandler(runtime, message, error, killProcess)
  };

  initLogger(runtime);
  initUUIDFactory(runtime);
  initMiddlewareHandler(runtime);
  initRegistry(runtime);
  initContextFactory(runtime);
  initEventbus(runtime);
  initValidator(runtime);
  initTransport(runtime);
  initCache(runtime);
  initActionInvoker(runtime);
  initServiceManager(runtime);
  initMetrics(runtime);
  initTracer(runtime);

  return runtime;
};
