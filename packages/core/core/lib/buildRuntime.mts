import { initLogger } from './runtime/initLogger.mts';
import { initMiddlewareHandler } from './runtime/initMiddlewareManager.mts';
import { initRegistry } from './runtime/initRegistry.mts';
import { initContextFactory } from './runtime/initContextFactory.mts';
import { initEventbus } from './runtime/initEventbus.mts';
import { initValidator } from './runtime/initValidator.mts';
import { initTransport } from './runtime/initTransport.mts';
import { initCache } from './runtime/initCache.mts';
import { initActionInvoker } from './runtime/initActionInvoker.mts';
import { initServiceManager } from './runtime/initServiceManager.mts';
import { initMetrics } from './runtime/initMetrics.mts';
import { initTracer } from './runtime/initTracing.mts';
import { initUUIDFactory } from './runtime/initUuidFactory.mts';
import { errorHandler, fatalErrorHandler } from './errorHandler.mts';
import { uuid } from '@weave-js/utils';
import packageJson from '../package.json' with { type: 'json' };
import pkg from 'eventemitter2';
const { EventEmitter2: EventEmitter } = pkg;
const { version } = packageJson;

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
export const initRuntime = (options) => {
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
