/**
 * @typedef {import('../types.__js').Runtime} Runtime
 * @typedef {import('../types.__js').BrokerOptions} BrokerOptions
 * @typedef {import('../types.__js').Broker} Broker
 * @typedef {import('../types.__js').Transport} Transport
*/

const { isFunction } = require('@weave-js/utils');
const path = require('path');
const glob = require('glob');
const Middlewares = require('../middlewares');

/**
 * Creates a new Weave Broker instance
 * @param {Runtime} runtime - Weave runtime.
 * @returns {Broker} Broker instance
*/
exports.createBrokerInstance = (runtime) => {
  const {
    version,
    options,
    bus,
    eventBus,
    middlewareHandler,
    registry,
    contextFactory,
    validator,
    log,
    services,
    transport
  } = runtime;

  log.info(`Initializing #weave node version ${version}`);
  log.info(`Node Id: ${options.nodeId}`);

  if (options.namespace) {
    log.info(`Namespace: ${options.namespace}`);
  }

  if (runtime.metrics) {
    runtime.metrics.init();
  }

  if (runtime.cache) {
    runtime.cache.init();
  }

  /** @type {Broker} */
  const broker = Object.create(null);

  broker.runtime = runtime;
  broker.registry = registry;
  broker.bus = bus;
  broker.nodeId = options.nodeId;
  broker.version = version;
  broker.options = options;
  broker.validator = validator;
  broker.contextFactory = contextFactory;
  broker.log = log;
  broker.createLogger = runtime.createLogger;

  broker.getUUID = function () {
    return runtime.generateUUID();
  };

  broker.getNextActionEndpoint = function (actionName, options = {}) {
    return registry.getNextAvailableActionEndpoint(actionName, options);
  };

  broker.emit = eventBus.emit.bind(broker);

  broker.broadcast = eventBus.broadcast.bind(broker);

  broker.broadcastLocal = eventBus.broadcastLocal.bind(broker);

  broker.call = runtime.actionInvoker.call.bind(broker);

  broker.multiCall = runtime.actionInvoker.multiCall.bind(broker);

  broker.waitForServices = services.waitForServices.bind(broker);

  broker.createService = services.createService.bind(broker);

  /**
   * Global error handler of the broker.
   * @param {*} error Error
   * @returns {void}
  */
  broker.handleError = runtime.handleError;

  broker.fatalError = runtime.fatalError;

  /**
  * Load and register a service from file.
  * @param {string} filename Path to the service file.
  * @returns {Service} Service
  */
  broker.loadService = function (filename) {
    const filePath = path.resolve(filename);
    const schema = require(filePath);
    const service = broker.createService(schema);

    if (service) {
      service.filename = filename;
    }

    return service;
  };

  broker.loadServices = function (folder = './services', fileMask = '*.service.js') {
    const serviceFiles = glob.sync(path.join(folder, fileMask));

    log.info(`Searching services in folder '${folder}' with name pattern '${fileMask}'.`);
    log.info(`${serviceFiles.length} services found.`);

    serviceFiles.forEach(fileName => broker.loadService(fileName));
    return serviceFiles.length;
  };

  /**
  * Starts the broker.
  * @returns {Promise} Promise
  */
  broker.start = async function () {
    const startTime = Date.now();
    await middlewareHandler.callHandlersAsync('starting', [runtime], true);

    if (transport) {
      await transport.connect();
    }

    // Start services using Promise.allSettled to continue even if some fail
    const serviceStartResults = await Promise.allSettled(
      services.serviceList.map(service => service.start())
    );

    const failedServices = serviceStartResults
      .map((result, index) => ({ result, service: services.serviceList[index] }))
      .filter(({ result }) => result.status === 'rejected');

    if (failedServices.length > 0) {
      const errorMessage = `Failed to start ${failedServices.length} of ${services.serviceList.length} services`;

      failedServices.forEach(({ result, service }) => {
        log.error(result.reason, `Unable to start service "${service.name}"`);
      });

      clearInterval(options.waitForServiceInterval);

      // If critical services failed, throw error to prevent startup
      if (failedServices.some(({ service }) => service.schema.critical !== false)) {
        const criticalFailures = failedServices.filter(({ service }) => service.schema.critical !== false);

        // If only one service failed, preserve the original error message for compatibility
        if (criticalFailures.length === 1 && services.serviceList.length === 1) {
          throw criticalFailures[0].result.reason;
        } else {
          throw new Error(`${errorMessage}. Critical services failed: ${criticalFailures.map(({ service }) => service.name).join(', ')}`);
        }
      } else {
        log.warn(`${errorMessage}, but continuing startup as no critical services failed`);
      }
    }

    runtime.state.isStarted = true;
    eventBus.broadcastLocal('$broker.started');
    registry.generateLocalNodeInfo(true);

    if (transport) {
      await transport.setReady();
    }

    await middlewareHandler.callHandlersAsync('started', [runtime], true);

    if (runtime.state.isStarted && isFunction(options.started)) {
      options.started.call(broker);
    }

    const duration = Date.now() - startTime;
    log.info(`Node "${options.nodeId}" with ${services.serviceList.length} services successfully started in ${duration}ms.`);
  };

  /**
    * Stops the broker.
    * @returns {Promise} Promise
  */
  broker.stop = async function () {
    runtime.state.isStarted = false;
    log.info('Shutting down the node...');

    await middlewareHandler.callHandlersAsync('stopping', [runtime], true);

    // Stop services using Promise.allSettled to attempt stopping all services
    const serviceStopResults = await Promise.allSettled(
      services.serviceList.map(service => service.stop())
    );

    const failedStops = serviceStopResults
      .map((result, index) => ({ result, service: services.serviceList[index] }))
      .filter(({ result }) => result.status === 'rejected');

    if (failedStops.length > 0) {
      failedStops.forEach(({ result, service }) => {
        log.error(result.reason, `Unable to stop service "${service.name}"`);
      });

      // If only one service and it failed, preserve original error for compatibility
      if (failedStops.length === 1 && services.serviceList.length === 1) {
        throw failedStops[0].result.reason;
      } else {
        log.error(`Failed to stop ${failedStops.length} of ${services.serviceList.length} services, but continuing shutdown`);
        // Continue with shutdown process rather than throwing
      }
    }

    if (transport) {
      await transport.disconnect();
    }

    if (runtime.cache) {
      log.debug('Stopping caching adapters.');
      await runtime.cache.stop();
    }

    if (runtime.metrics) {
      log.debug('Stopping metrics.');
      await runtime.metrics.stop();
    }

    if (runtime.tracer) {
      log.debug('Stopping tracing adapters.');
      await runtime.tracer.stop();
    }

    await middlewareHandler.callHandlersAsync('stopped', [runtime], true);

    if (!runtime.state.isStarted && isFunction(options.stopped)) {
      options.stopped.call(runtime);
    }

    log.info('The node was successfully shut down. Bye bye! 👋');

    eventBus.broadcastLocal('$broker.stopped');

    process.removeListener('beforeExit', onClose);
    process.removeListener('exit', onClose);
    process.removeListener('SIGINT', onClose);
    process.removeListener('SIGTERM', onClose);

    // todo: handle errors
  };

  /**
   * Ping other nodes
   * @param {string=} nodeId Node ID
   * @param {number} timeout Timeout
   * @returns {Promise<Object<string, number>>} Result
  */
  broker.ping = function (nodeId, timeout = 3000) {
    if (transport && transport.isConnected) {
      if (nodeId) {
        return new Promise((resolve) => {
          const timeoutTimer = setTimeout(() => {
            bus.off('$node.pong', pongHandler);
            return resolve(null);
          }, timeout);

          const pongHandler = pong => {
            clearTimeout(timeoutTimer);
            bus.off('$node.pong', pongHandler);
            resolve(pong);
          };

          bus.on('$node.pong', pongHandler);
          transport.sendPing(nodeId);
        });
      } else {
        const pongs = {};

        const nodes = registry.nodeCollection.list({})
          .filter(node => !node.isLocal)
          .map(node => node.id);

        const onFlight = new Set(nodes);

        nodes.forEach(nodeId => {
          pongs[nodeId] = null;
        });

        return new Promise((resolve) => {
          // todo: handle timeout
          const timeoutTimer = setTimeout(() => {
            bus.off('$node.pong', pongHandler);
            resolve(pongs);
          }, timeout);

          const pongHandler = pong => {
            pongs[pong.nodeId] = pong;
            onFlight.delete(pong.nodeId);
            if (onFlight.size === 0) {
              clearTimeout(timeoutTimer);
              bus.off('$node.pong', pongHandler);
              resolve(pongs);
            }
          };

          bus.on('$node.pong', pongHandler);
          nodes.map(nodeId => transport.sendPing(nodeId));
        });
      }
    }

    return Promise.resolve(nodeId ? null : {});
  };

  broker.bus.on('$node.disconnected', ({ nodeId }) => {
    runtime.transport.removePendingRequestsByNodeId(nodeId);
    services.serviceChanged(false);
  });

  /**
   * Register middlewares
   * @param {Array<Object>} customMiddlewares Array of user defined middlewares
   * @returns {void}
   */
  const registerMiddlewares = (customMiddlewares) => {
    if (Array.isArray(customMiddlewares) && customMiddlewares.length > 0) {
      customMiddlewares.forEach(middleware => middlewareHandler.add(middleware));
    }

    if (options.loadInternalMiddlewares) {
      middlewareHandler.add(Middlewares.ActionHooks);

      if (options.validateActionParams && validator) {
        middlewareHandler.add(Middlewares.Validator);
      }

      if (options.bulkhead.enabled) {
        middlewareHandler.add(Middlewares.Bulkhead);
      }

      if (runtime.cache) {
        middlewareHandler.add(Middlewares.Cache);
      }

      if (options.contextTracking.enabled) {
        middlewareHandler.add(Middlewares.ContextTracker);
      }

      if (options.circuitBreaker.enabled) {
        middlewareHandler.add(Middlewares.CircuitBreaker);
      }

      middlewareHandler.add(Middlewares.Timeout);

      if (options.retryPolicy.enabled) {
        middlewareHandler.add(Middlewares.Retry);
      }

      middlewareHandler.add(Middlewares.ErrorHandler);

      if (options.tracing.enabled) {
        middlewareHandler.add(Middlewares.Tracing);
      }

      if (options.metrics.enabled) {
        middlewareHandler.add(Middlewares.Metrics);
      }
    }

    runtime.actionInvoker.call = middlewareHandler.wrapMethod('call', runtime.actionInvoker.call);
    runtime.actionInvoker.multiCall = middlewareHandler.wrapMethod('multiCall', broker.multiCall);
    runtime.eventBus.emit = middlewareHandler.wrapMethod('emit', runtime.eventBus.emit);
    runtime.eventBus.broadcast = middlewareHandler.wrapMethod('broadcast', runtime.eventBus.broadcast);
    runtime.eventBus.broadcastLocal = middlewareHandler.wrapMethod('broadcastLocal', runtime.eventBus.broadcastLocal);

    broker.createService = middlewareHandler.wrapMethod('createService', broker.createService);
    broker.loadService = middlewareHandler.wrapMethod('loadService', broker.loadService);
    broker.loadServices = middlewareHandler.wrapMethod('loadServices', broker.loadServices);
    broker.ping = middlewareHandler.wrapMethod('ping', broker.ping);
  };

  if (isFunction(options.beforeRegisterMiddlewares)) {
    options.beforeRegisterMiddlewares.call(broker, { broker, runtime });
  }

  registerMiddlewares(options.middlewares);

  /* istanbul ignore next */
  const onClose = () => broker.stop()
    .catch(error => broker.log.error(error))
    .then(() => process.exit(0));

  process.setMaxListeners(0);
  process.on('beforeExit', onClose);
  process.on('exit', onClose);
  process.on('SIGINT', onClose);
  process.on('SIGTERM', onClose);

  Object.assign(runtime, { broker });

  middlewareHandler.callHandlersSync('created', [runtime]);

  return broker;
};
