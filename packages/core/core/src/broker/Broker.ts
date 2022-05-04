import { EventEmitter2 } from "eventemitter2";
import { createLogger } from "../logger";
import { Logger } from "../logger/Logger";
import { Node } from "../registry/Node";
import { Runtime } from "../runtime/Runtime";
import { Service } from "../service/Service";
import { ServiceSchema } from "../service/ServiceSchema";
import { BrokerContext } from "./BrokerContext";

// node packages
const { isFunction } = require('@weave-js/utils');
const path = require('path');
const glob = require('glob');
const { registerMiddlewares } = require('./registerMiddlewares');

/** 
 * Types
 */

type ContextFactory = any
type Validator = any

class Broker extends BrokerContext {
  runtime: Runtime;
  nodeId: string;
  log: Logger = createLogger();
  bus: EventEmitter2;
  validator: Validator;
  contextFactory: ContextFactory;

  /**
   * 
   * @param runtime 
  */
  constructor (runtime: Runtime) {
    super(runtime)

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
    } = this.runtime;
    

    // Log Messages
    log.info(`Initializing #weave node version ${version}`);
    log.info(`Node Id: ${options.nodeId}`);
  
    // Output namespace
    if (options.namespace) {
      log.info(`Namespace: ${options.namespace}`);
    }
  
    // Init metrics
    if (runtime.metrics) {
      this.runtime.metrics.init();
    }
  
    // Init cache
    if (runtime.cache) {
      this.runtime.cache.init();
    }

    this.registry = registry;
    this.bus = bus;
    this.nodeId = options.nodeId;
    this.options = options;
    this.validator = validator;
    this.contextFactory = contextFactory;
    this.log = log;
    this.createLogger = runtime.createLogger;
  }

  /**
   * Generate a new UUID from Factory
   * @returns {string}
   */
  getUUID (): string {
    return this.runtime.generateUUID();
  }

  loadServices (...args: string[]): number {
    this.log.warning('This method is deprecated. Please use loadServicesFromFolder instead')
    return this.loadServicesFromFolder(...args);
  }

  loadServicesFromFolder (folder: string = './services', filenamePattern: string = '*.service.js'): number {
    const serviceFiles: string[] = glob.sync(path.join(folder, filenamePattern));

    this.log.info(`Searching services in folder '${folder}' with name pattern '${filenamePattern}'.`);
    this.log.info(`${serviceFiles.length} services found.`);

    serviceFiles.forEach(fileName => this.loadServiceFromFile(fileName));
    return serviceFiles.length;
  }

  waitForServices () {
    return this.runtime.services.waitForServices.bind(broker);
  }

  /**
   * @deprecated Please use loadServicesFromFolder instead
   * @param filename
   * @returns {Service}
   */
  loadService (filename: string) {
    this.log.warning('This method (loadService) is deprecated. Please use loadServicesFromFolder instead')

    return this.loadServiceFromFile(filename)
  };

  loadServiceFromFile (filename: string): Service {
    const filePath: string = path.resolve(filename);
    const schema = require(filePath);
    const service = this.createService(schema);

    if (service) {
      service.filename = filename;
    }

    return service;
  }

  createService (schema: ServiceSchema): Service {
    return this.runtime.services.createService(schema);
  }

  emit () {
    return this.runtime.eventBus.emit.bind(this, ...arguments)
  }

  broadcast () {
    return this.runtime.eventBus.broadcast.bind(this, ...arguments); 
  }

  broadcastLocal () {
    return this.runtime.eventBus.broadcastLocal.bind(broker, ...arguments);
  }

  call () {
    return this.runtime.actionInvoker.call.bind(broker, ...arguments);
  }

  multiCall () {
    return this.runtime.actionInvoker.multiCall.bind(broker);
  }

  handleError () {
    return this.runtime.handleError(...arguments);
  }

  async start () {
    const startTime = Date.now();
    await this.runtime.middlewareHandler.callHandlersAsync('starting', [runtime], true);

    // If transport is used, we connect the transport adapter.
    if (this.runtime.transport) {
      await this.runtime.transport.connect();
    }

    try {
      await Promise.all(services.serviceList.map(service => service.start()));
    } catch (error) {
      log.error(error, 'Unable to start all services');
      clearInterval(options.waitForServiceInterval);
      throw error;
    }

    runtime.state.isStarted = true;
    eventBus.broadcastLocal('$broker.started');
    // refresh local node information
    registry.generateLocalNodeInfo(true);

    // If transport is used, we set the transport ready to inform the other nodes
    if (transport) {
      await transport.setReady();
    }

    await middlewareHandler.callHandlersAsync('started', [runtime], true);

    if (runtime.state.isStarted && isFunction(options.started)) {
      options.started.call(broker);
    }

    const duration = Date.now() - startTime;
    log.info(`Node "${options.nodeId}" with ${services.serviceList.length} services successfully started in ${duration}ms.`);
  }
// }

// const createBrokerInstance = (runtime: Runtime): Broker => {
//   const {
//     version,
//     options,
//     bus,
//     eventBus,
//     middlewareHandler,
//     registry,
//     contextFactory,
//     validator,
//     log,
//     services,
//     transport
//   } = runtime;

//   const broker: Broker = Object.create(null);

//   broker.runtime = runtime;
//   broker.registry = registry;
//   broker.bus = bus;
//   broker.nodeId = options.nodeId;
//   broker.version = version;
//   broker.options = options;
//   broker.validator = validator;
//   broker.contextFactory = contextFactory;
//   broker.log = log;
//   broker.createLogger = runtime.createLogger;

//   broker.getUUID = (): string => {
//     return runtime.generateUUID();
//   };

//   broker.getNextActionEndpoint = function (actionName, options = {}) {
//     return registry.getNextAvailableActionEndpoint(actionName, options);
//   };

//   broker.emit = eventBus.emit.bind(broker);

//   broker.broadcast = eventBus.broadcast.bind(broker);

//   broker.broadcastLocal = eventBus.broadcastLocal.bind(broker);

//   broker.call = runtime.actionInvoker.call.bind(broker);

//   broker.multiCall = runtime.actionInvoker.multiCall.bind(broker);

//   broker.waitForServices = services.waitForServices.bind(broker);

//   broker.createService = services.createService.bind(broker);

//   /**
//    * Global error handler of the broker.
//    * @param {*} error Error
//    * @returns {void}
//   */
//   broker.handleError = runtime.handleError;

//   broker.fatalError = runtime.fatalError;

//   /**
//   * Load and register a service from file.
//   * @param {string} filename Path to the service file.
//   * @returns {Service} Service
//   */
//   broker.loadServiceFromFile = function (filename: string) {
//     const filePath = path.resolve(filename);
//     const schema = require(filePath);
//     const service = broker.createService(schema);

//     if (service) {
//       service.filename = filename;
//     }

//     return service;
//   };

//   broker.loadService = function (filename: string): Service {
//     return broker.loadServiceFromFile(filename)
//   };

//   broker.loadServices = function (folder: string = './services', fileMask: string = '*.service.js'): Service[] {
//     const serviceFiles: string[] = glob.sync(path.join(folder, fileMask));

//     log.info(`Searching services in folder '${folder}' with name pattern '${fileMask}'.`);
//     log.info(`${serviceFiles.length} services found.`);

//     const services = serviceFiles.map((fileName) => broker.loadService(fileName));
//     return services;
//   };

//   /**
//   * Starts the broker.
//   * @returns {Promise} Promise
//   */
//   broker.start = async function () {
//     const startTime = Date.now();
//     await middlewareHandler.callHandlersAsync('starting', [runtime], true);

//     // If transport is used, we connect the transport adapter.
//     if (transport) {
//       await transport.connect();
//     }

//     try {
//       await Promise.all(services.serviceList.map(service => service.start()));
//     } catch (error) {
//       log.error(error, 'Unable to start all services');
//       clearInterval(options.waitForServiceInterval);
//       throw error;
//     }

//     runtime.state.isStarted = true;
//     eventBus.broadcastLocal('$broker.started');
//     // refresh local node information
//     registry.generateLocalNodeInfo(true);

//     // If transport is used, we set the transport ready to inform the other nodes
//     if (transport) {
//       await transport.setReady();
//     }

//     await middlewareHandler.callHandlersAsync('started', [runtime], true);

//     if (runtime.state.isStarted && isFunction(options.started)) {
//       options.started.call(broker);
//     }

//     const duration = Date.now() - startTime;
//     log.info(`Node "${options.nodeId}" with ${services.serviceList.length} services successfully started in ${duration}ms.`);
//   };

//   /**
//     * Stops the broker.
//     * @returns {Promise} Promise
//   */
//   broker.stop = async function () {
//     runtime.state.isStarted = false;
//     log.info('Shutting down the node...');

//     await middlewareHandler.callHandlersAsync('stopping', [runtime], true);

//     // Stop services
//     try {
//       await Promise.all(services.serviceList.map(service => service.stop()));
//     } catch (error) {
//       log.error(error, 'Unable to stop all services.');
//       throw error;
//     }

//     // Disconnect transports
//     if (transport) {
//       await transport.disconnect();
//     }

//     // Stop cache
//     if (runtime.cache) {
//       log.debug('Stopping caching adapters.');
//       await runtime.cache.stop();
//     }

//     // Stop metrics
//     if (runtime.metrics) {
//       log.debug('Stopping metrics.');
//       await runtime.metrics.stop();
//     }

//     // Stop tracers
//     if (runtime.tracer) {
//       log.debug('Stopping tracing adapters.');
//       await runtime.tracer.stop();
//     }

//     // Call "stopped" middleware method.
//     await middlewareHandler.callHandlersAsync('stopped', [runtime], true);

//     // Call "stopped" lifecycle hook
//     if (!runtime.state.isStarted && isFunction(options.stopped)) {
//       options.stopped.call(runtime);
//     }

//     log.info('The node was successfully shut down. Bye bye! 👋');

//     eventBus.broadcastLocal('$broker.stopped');

//     process.removeListener('beforeExit', onClose);
//     process.removeListener('exit', onClose);
//     process.removeListener('SIGINT', onClose);
//     process.removeListener('SIGTERM', onClose);
//   };

//   broker.ping = function (nodeId?: string, timeout: number = 3000): Promise<any> {
//     if (transport && transport.isConnected) {
//       if (nodeId) {
//         return new Promise((resolve) => {
//           const timeoutTimer = setTimeout(() => {
//             bus.off('$node.pong', pongHandler);
//             return resolve(null);
//           }, timeout);

//           const pongHandler = (pong) => {
//             clearTimeout(timeoutTimer);
//             bus.off('$node.pong', pongHandler);
//             resolve(pong);
//           };

//           bus.on('$node.pong', pongHandler);
//           transport.sendPing(nodeId);
//         });
//       } else {
//         // handle arrays
//         const pongs = {};

//         const nodes: Node[] = registry.nodeCollection.list({})
//           .filter((node) => !node.isLocal)
//           .map(node => node.id);

//         const onFlight = new Set(nodes);

//         nodes.forEach((nodeId) => {
//           pongs[nodeId] = null;
//         });

//         return new Promise((resolve) => {
//           // todo: handle timeout
//           const timeoutTimer = setTimeout(() => {
//             bus.off('$node.pong', pongHandler);
//             resolve(pongs);
//           }, timeout);

//           const pongHandler = (pong) => {
//             pongs[pong.nodeId] = pong;
//             onFlight.delete(pong.nodeId);
//             if (onFlight.size === 0) {
//               clearTimeout(timeoutTimer);
//               bus.off('$node.pong', pongHandler);
//               resolve(pongs);
//             }
//           };

//           bus.on('$node.pong', pongHandler);
//           nodes.map(nodeId => transport.sendPing(nodeId));
//         });
//       }
//     }

//     return Promise.resolve(nodeId ? null : {});
//   };

//   // Register internal broker events
//   broker.bus.on('$node.disconnected', ({ nodeId }) => {
//     runtime.transport.removePendingRequestsByNodeId(nodeId);
//     services.serviceChanged(false);
//   });

//   // Run "beforeRegisterMiddlewares" hook
//   if (isFunction(options.beforeRegisterMiddlewares)) {
//     options.beforeRegisterMiddlewares.call(broker, { broker, runtime });
//   }

//   // Add broker reference to runtime
//   Object.assign(runtime, { broker });

//   // Register middlewares
//   registerMiddlewares(runtime, options.middlewares);

//   // Stop the broker greaceful
//   /* istanbul ignore next */
//   const onClose = () => broker.stop()
//     .catch(error => broker.log.error(error))
//     .then(() => process.exit(0));

//   // SIGTERM listener
//   process.setMaxListeners(0);
//   process.on('beforeExit', onClose);
//   process.on('exit', onClose);
//   process.on('SIGINT', onClose);
//   process.on('SIGTERM', onClose);

//   // Call middleware hook for broker created.
//   middlewareHandler.callHandlersSync('created', [runtime]);

//   return broker;
// };

// export { Broker, createBrokerInstance };
