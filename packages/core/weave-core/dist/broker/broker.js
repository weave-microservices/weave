"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBroker = void 0;
/**
 * Weave service Broker.
 * @module weave
 */
// node packages
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const glob_1 = __importDefault(require("glob"));
const utils_1 = require("@weave-js/utils");
const default_options_1 = require("./default-options");
const logger_1 = require("../logger");
const service_1 = require("../registry/service");
const middleware_1 = require("./middleware");
const registry_1 = require("../registry");
const context_factory_1 = require("./context-factory");
const Middlewares = __importStar(require("../middlewares"));
const validator_1 = require("./validator");
const CacheModule = __importStar(require("../cache"));
const health_1 = __importDefault(require("./health"));
const adapters_1 = __importDefault(require("../transport/adapters"));
const transport_factory_1 = require("../transport/transport-factory");
const eventemitter2_1 = require("eventemitter2");
const errors_1 = require("../errors");
const tracing_1 = require("../tracing");
const metrics_1 = require("../metrics");
const broker_metrics_1 = require("./broker-metrics");
const log_types_1 = require("../logger/log-types");
const version = 'sdasd';
/**
 * Creates a new Weave instance
 * @export
 * @param {BrokerOptions} options BrokerOptions
 * @returns {Broker}
 */
function createBroker(options) {
    // backwards compatibility for logger
    if (options.logger === null) {
        options.logger = {
            enabled: false
        };
    }
    // get default options
    const defaultOptions = default_options_1.getDefaultOptions();
    // merge options with default options
    options = utils_1.defaultsDeep(options, defaultOptions);
    // If no node id is set - create one.
    const nodeId = options.nodeId || `${os_1.default.hostname()}-${process.pid}`;
    // internal service collection.
    const services = [];
    /* eslint-disable no-use-before-define */
    /**
     * Create a new Logger.
     * @param {string} moduleName - Name of the module
     * @param {*} service - Service properties
     * @returns {import('../logger/index.js/index.js.js.js').Logger} Logger
     */
    /* eslint-enable no-use-before-define */
    const createLogger = (moduleName, service) => {
        const bindings = {
            nodeId: nodeId
        };
        if (service) {
            bindings.service = service;
            if (service.version) {
                bindings.version = service.version;
            }
        }
        else {
            bindings.moduleName = moduleName;
        }
        // todo: rethink custom logger implementation
        // if (typeof options.logger === 'function') {
        //     return options.logger(bindings, options.logger.logLevel);
        // }
        // Only show info in production mode
        if (process.env.NODE_ENV === 'production') {
            options.logger.logLevel = options.logger.logLevel || log_types_1.LogLevel.Info;
        }
        else if (process.env.NODE_ENV === 'test') {
            options.logger.logLevel = options.logger.logLevel || log_types_1.LogLevel.Error;
        }
        else {
            options.logger.logLevel = options.logger.logLevel || log_types_1.LogLevel.Debug;
        }
        return logger_1.createDefaultLogger(options.logger, bindings);
    };
    // Create the default logger for the broker.
    const log = createLogger('WEAVE');
    // Internal modules
    const middlewareHandler = middleware_1.createMiddlewareHandler();
    const registry = registry_1.createRegistry();
    const contextFactory = context_factory_1.createContextFactory();
    const health = health_1.default();
    const validator = validator_1.createValidator();
    // Internal Methods
    const addLocalServices = service => {
        services.push(service);
    };
    const servicesChanged = (isLocalService) => {
        // Send local notification.
        broker.broadcastLocal('$services.changed', { isLocalService });
        // If the service is a local service - send current node informations to other nodes
        if (broker.isStarted && isLocalService && broker.transport) {
            broker.transport.sendNodeInfo();
        }
    };
    const registerLocalService = (registryItem, notify = false) => {
        registry.registerLocalService(registryItem);
        servicesChanged(notify);
    };
    const serviceWatcher = function (service, onServiceChanged) {
        if (service.filename && onServiceChanged) {
            const debouncedOnServiceChange = utils_1.debounce(onServiceChanged, 500);
            const watcher = fs_1.default.watch(service.filename, (eventType, filename) => {
                log.info(`The Service ${service.name} has been changed. (${eventType}, ${filename}) `);
                watcher.close();
                debouncedOnServiceChange(this, service);
            });
        }
    };
    const destroyService = (service) => Promise.resolve()
        .then(() => service.stop())
        .then(() => log.info(`Service "${service.name}" was stopped.`))
        .then(() => {
        registry.deregisterService(service.name, service.version);
        log.info(`Service "${service.name}" was deregistered.`);
        // Remove service from service store.
        services.splice(services.indexOf(service), 1);
        // Fire services changed event
        servicesChanged(true);
        return Promise.resolve();
    })
        .catch(error => log.error(`Unable to stop service "${service.name}"`, error));
    const onServiceChanged = (broker, service) => __awaiter(this, void 0, void 0, function* () {
        const filename = service.filename;
        // Clear the require cache
        Object.keys(require.cache).forEach(key => {
            if (key === filename) {
                delete require.cache[key];
            }
        });
        // Service has changed - 1. destroy the service, then reload it
        yield destroyService(service);
        broker.loadService(filename);
    });
    // Log Messages
    log.info(`Initializing #weave node version ${version}`);
    log.info(`Node Id: ${nodeId}`);
    if (options.namespace) {
        log.info(`Namespace: ${options.namespace}`);
    }
    // broker object
    const broker = {
        /**
        * Event bus
        * @returns {EventEmitter} Service object.
        */
        bus: new eventemitter2_1.EventEmitter2({
            wildcard: true,
            maxListeners: 1000
        }),
        version,
        options,
        nodeId,
        contextFactory,
        isStarted: false,
        log,
        createLogger,
        getUUID() {
            if (broker.options.uuidFactory && utils_1.isFunction(broker.options.uuidFactory)) {
                return broker.options.uuidFactory(broker);
            }
            return utils_1.uuid();
        },
        health,
        registry,
        getNextActionEndpoint(actionName, nodeId) {
            return registry.getNextAvailableActionEndpoint(actionName, nodeId);
        },
        /**
         * Call a action.
         * @param {*} actionName Name of the action.
         * @param {*} data Action parameters
         * @param {*} [opts={}] Options
         * @returns {Promise} Promise
        */
        call(actionName, data, opts = {}) {
            const endpoint = registry.getNextAvailableActionEndpoint(actionName, opts.nodeId);
            if (endpoint instanceof Error) {
                return Promise.reject(endpoint)
                    .catch(error => this.handleError(error));
            }
            const action = endpoint.action;
            const nodeId = endpoint.node.id;
            let context;
            if (opts.context !== undefined) {
                context = opts.context;
                context.nodeId = nodeId;
            }
            else {
                context = contextFactory.create(endpoint, data, opts);
            }
            if (endpoint.isLocal) {
                log.debug('Call action local.', { action: actionName, requestId: context.requestId });
            }
            else {
                log.debug('Call action on remote node.', { action: actionName, nodeId, requestId: context.requestId });
            }
            const p = action.handler(context, endpoint.service, broker);
            p.context = context;
            return p;
        },
        /**
         * Call multiple actions.
         * @param {Array<Action>} actions Array of actions.
         * @returns {Promise} Promise
        */
        multiCall(actions) {
            if (Array.isArray(actions)) {
                return Promise.all(actions.map(item => this.call(item.actionName, item.data, item.options)));
            }
            else {
                return Promise.reject(new errors_1.WeaveError('Actions need to be an Array'));
            }
        },
        /**
         * Emit a event on all services (grouped and load balanced).
         * @param {String} eventName Name of the event
         * @param {any} payload Payload
         * @param {*} [options=null] Groups
         * @returns {void}
         */
        emit(eventName, payload, options) {
            if (Array.isArray(options)) {
                options = { groups: options };
            }
            else if (options == null) {
                options = {};
            }
            const promises = [];
            const context = contextFactory.create(null, payload, options);
            context.eventType = 'emit';
            context.eventName = eventName;
            context.eventGroups = options.groups;
            // Emit system events
            if (/^\$/.test(eventName)) {
                this.bus.emit(eventName, payload);
            }
            const endpoints = registry.events.getBalancedEndpoints(eventName, options.groups);
            const groupedEndpoints = {};
            endpoints.map(([endpoint, groupName]) => {
                if (endpoint) {
                    if (endpoint.node.id === this.nodeId) {
                        // Local event. Call handler
                        promises.push(endpoint.action.handler(context));
                    }
                    else {
                        const e = groupedEndpoints[endpoint.node.id];
                        if (e) {
                            e.push(groupName);
                        }
                        else {
                            groupedEndpoints[endpoint.node.id] = {
                                endpoint,
                                groups: [groupName]
                            };
                        }
                    }
                }
            });
            // send remote events
            if (this.transport) {
                Object.values(groupedEndpoints)
                    .forEach(groupedEndpoint => {
                    const newContext = context.copy();
                    newContext.setEndpoint(groupedEndpoint.endpoint);
                    newContext.eventGroups = groupedEndpoint.groups;
                    promises.push(this.transport.sendEvent(newContext));
                });
                // this.transport.sendBalancedEvent(eventName, payload, groupedEndpoints)
            }
            return Promise.all(promises);
        },
        /**
         * Send a broadcasted event to all services.
         * @param {String} eventName Name of the event
         * @param {any} payload Payload
         * @param {*} [options=null] Groups
         * @returns {void}
        */
        broadcast(eventName, payload, options) {
            if (Array.isArray(options)) {
                options = { groups: options };
            }
            else if (options == null) {
                options = {};
            }
            const promises = [];
            if (this.transport) {
                // create context
                // todo: create an event context object
                const context = contextFactory.create(null, payload, options);
                context.eventType = 'broadcast';
                context.eventName = eventName;
                context.eventGroups = options.groups;
                // Avoid to broadcast internal events.
                if (!/^\$/.test(eventName)) {
                    const endpoints = registry.events.getAllEndpointsUniqueNodes(eventName, options.groups);
                    endpoints.map(endpoint => {
                        if (endpoint.node.id !== this.nodeId) {
                            const newContext = context.copy();
                            newContext.setEndpoint(endpoint);
                            promises.push(this.transport.sendEvent(newContext));
                        }
                    });
                }
            }
            promises.push(this.broadcastLocal(eventName, payload, options));
            return Promise.all(promises);
        },
        /**
        *Send a broadcasted event to all local services.
        * @param {String} eventName Name of the event
        * @param {any} payload Payload
        * @param {*} [options=null] Options
        * @returns {void}
        */
        broadcastLocal(eventName, payload, options) {
            // If the given group is no array - wrap it.
            if (Array.isArray(options)) {
                options = { groups: options };
            }
            else if (options == null) {
                options = {};
            }
            const context = contextFactory.create(null, payload, options);
            context.eventType = 'broadcastLocal';
            context.eventName = eventName;
            // Emit the event on the internal event bus
            if (/^\$/.test(eventName)) {
                this.bus.emit(eventName, payload);
            }
            return registry.events.emitLocal(context);
        },
        /* eslint-disable no-use-before-define */
        /**
         * Create a new Service and add it to the registry
         * @param {import('../registry/service.js').ServiceSchema} schema - Schema of the Service
         * @returns {Service} Service object.
        */
        /* eslint-enable2 no-use-before-define */
        createService(schema) {
            try {
                const newService = service_1.createServiceFromSchema(this, middlewareHandler, addLocalServices, registerLocalService, schema);
                // if the broker is already startet - start the service.
                if (this.isStarted) {
                    newService.start()
                        .catch(error => log.error(`Unable to start service ${newService.name}: ${error}`));
                }
                return newService;
            }
            catch (error) {
                log.error(error);
                this.handleError(error);
            }
        },
        /**
         * Load and register a service from file.
         * @param {string} fileName Path to the service file.
         * @returns {Service} Service
        */
        loadService(fileName) {
            const filePath = path_1.default.resolve(fileName);
            const schema = Promise.resolve().then(() => __importStar(require(filePath)));
            const service = this.createService(schema);
            // If the "watchServices" option is set - add service to service watcher.
            if (options.watchServices) {
                service.filename = fileName;
                serviceWatcher.call(this, service, onServiceChanged);
            }
            return service;
        },
        /**
         * Load services from a folder.
         * @param {string} [folder='./services'] Path of the folder.
         * @param {string} [fileMask='*.service.js'] Pattern of the service files
         * @returns {number} Amount of services
        */
        loadServices(folderPath = './services', fileMask = '*.service.js') {
            const serviceFiles = glob_1.default.sync(path_1.default.join(folderPath, fileMask));
            this.log.info(`Searching services in folder '${folderPath}' with name pattern '${fileMask}'.`);
            this.log.info(`${serviceFiles.length} services found.`);
            serviceFiles.forEach(fileName => this.loadService(fileName));
            return serviceFiles.length;
        },
        /**
         * Wait for services before continuing startup.
         * @param {Array.<string>} serviceNames Names of the services
         * @param {Number} timeout Time in Miliseconds before the broker stops.
         * @param {Number} interval Time in Miliseconds to check for services.
         * @returns {Promise} Promise
        */
        waitForServices(serviceNames, timeout, interval = 500) {
            if (!Array.isArray(serviceNames)) {
                serviceNames = [serviceNames];
            }
            const startTimestamp = Date.now();
            return new Promise((resolve, reject) => {
                // todo: add timout for service waiter
                this.log.warn(`Waiting for services '${serviceNames.join(',')}'`);
                const serviceCheck = () => {
                    const count = serviceNames.filter(serviceName => registry.hasService(serviceName));
                    this.log.wait(`${count.length} services of ${serviceNames.length} available. Waiting...`);
                    if (count.length === serviceNames.length) {
                        return resolve();
                    }
                    if (timeout && (Date.now() - startTimestamp) > timeout) {
                        return reject(new errors_1.WeaveError('The waiting of the services is interrupted due to a timeout.', 500, 'WAIT_FOR_SERVICE', { services: serviceNames }));
                    }
                    this.options.waitForServiceInterval = setTimeout(serviceCheck, interval);
                };
                serviceCheck();
            });
        },
        /**
         * Starts the broker.
         * @returns {Promise} Promise
        */
        start() {
            const startTime = Date.now();
            return Promise.resolve()
                .then(() => middlewareHandler.callHandlersAsync('starting', [this], true))
                .then(() => {
                if (this.transport) {
                    return this.transport.connect();
                }
            })
                .then(() => {
                return Promise.all(services.map(service => service.start()))
                    .catch(error => {
                    this.log.error('Unable to start all services', error);
                    clearInterval(options.waitForServiceInterval);
                    this.handleError(error);
                });
            })
                .then(() => {
                this.isStarted = true;
                this.broadcastLocal('$broker.started');
                this.registry.generateLocalNodeInfo(true);
            })
                .then(() => {
                if (this.transport) {
                    return this.transport.setReady();
                }
            })
                .then(() => middlewareHandler.callHandlersAsync('started', [this], true))
                .then(() => {
                if (this.isStarted && utils_1.isFunction(options.started)) {
                    options.started.call(this);
                }
            })
                .then(() => {
                const duration = Date.now() - startTime;
                log.success(`Node "${nodeId}" with ${services.length} services successfully started in ${duration}ms.`);
            });
        },
        /**
         * Stops the broker.
         * @returns {Promise} Promise
        */
        stop() {
            this.isStarted = false;
            return Promise.resolve()
                .then(() => {
                log.info('Shutting down the node...');
            })
                .then(() => middlewareHandler.callHandlersAsync('stopping', [this], true))
                .then(() => {
                return Promise.all(services.map(service => service.stop()))
                    .catch(error => {
                    this.log.error('Unable to stop all services.', error);
                    return Promise.reject(error);
                });
            })
                .then(() => {
                if (this.transport) {
                    return this.transport.disconnect();
                }
            })
                .then(() => {
                if (this.cache) {
                    log.debug('Stopping caching adapters.');
                    return this.cache.stop();
                }
            })
                .then(() => {
                if (this.tracer) {
                    log.debug('Stopping tracing adapters.');
                    return this.tracer.stop();
                }
            })
                .then(() => middlewareHandler.callHandlersAsync('stopped', [this], true))
                .then(() => {
                if (!this.isStarted && utils_1.isFunction(options.stopped)) {
                    options.stopped.call(this);
                }
            })
                .then(() => {
                log.success('The node was successfully shut down. Bye bye! 👋');
                this.broadcastLocal('$broker.closed');
                process.removeListener('beforeExit', onClose);
                process.removeListener('exit', onClose);
                process.removeListener('SIGINT', onClose);
                process.removeListener('SIGTERM', onClose);
            });
        },
        /**
         * Send a ping to connected nodes.
         * @param {*} nodeId Node id
         * @param {number} [timeout=3000] Ping timeout
         * @returns {Array} Ping result
        */
        ping(nodeId, timeout = 3000) {
            if (broker.transport && broker.transport.isConnected) {
                if (nodeId) {
                    return new Promise((resolve) => {
                        const timeoutTimer = setTimeout(() => {
                            broker.bus.off('$node.pong', pongHandler);
                            return resolve(null);
                        }, timeout);
                        const pongHandler = pong => {
                            clearTimeout(timeoutTimer);
                            broker.bus.off('$node.pong', pongHandler);
                            resolve(pong);
                        };
                        broker.bus.on('$node.pong', pongHandler);
                        this.transport.sendPing(nodeId);
                    });
                }
                else {
                    // handle arrays
                    const pongs = {};
                    const nodes = this.registry.getNodeList({})
                        .filter(node => !node.isLocal)
                        .map(node => node.id);
                    const onFlight = new Set(nodes);
                    nodes.forEach(nodeId => {
                        pongs[nodeId] = null;
                    });
                    return new Promise((resolve) => {
                        // todo: handle timeout
                        const timeoutTimer = setTimeout(() => {
                            broker.bus.off('$node.pong', pongHandler);
                            resolve(pongs);
                        }, timeout);
                        const pongHandler = pong => {
                            pongs[pong.nodeId] = pong;
                            onFlight.delete(pong.nodeId);
                            if (onFlight.size === 0) {
                                clearTimeout(timeoutTimer);
                                broker.bus.off('$node.pong', pongHandler);
                                resolve(pongs);
                            }
                        };
                        broker.bus.on('$node.pong', pongHandler);
                        nodes.map(nodeId => this.transport.sendPing(nodeId));
                    });
                }
            }
            return Promise.resolve(nodeId ? null : []);
        },
        /**
         * Global error handler of the broker.
         * @param {*} error Error
         * @returns {void}
         */
        handleError(error) {
            if (options.errorHandler) {
                return options.errorHandler.call(broker, error);
            }
            throw error;
        },
        fatalError(message, error, killProcess = true) {
            if (options.logger.enabled) {
                log.fatal(message, error);
            }
            else {
                console.log(message, error);
            }
            if (killProcess) {
                process.exit(1);
            }
        }
    };
    // Register internal broker events
    broker.bus.on('$node.disconnected', ({ nodeId }) => {
        broker.transport.removePendingRequestsByNodeId(nodeId);
        servicesChanged(false);
    });
    if (options.transport.adapter) {
        const adapter = adapters_1.default.resolve(broker, options.transport);
        if (adapter) {
            broker.transport = transport_factory_1.createTransport(broker, adapter, middlewareHandler);
        }
    }
    // const loadBalancingStrategy = LoadBalancing.resolve(options.registry.loadBalancingStrategy)
    // Metrics module
    broker.metrics = metrics_1.createMetricRegistry(broker, options.metrics);
    broker.metrics.init();
    broker_metrics_1.registerMetrics(broker);
    // Module initialisation
    registry.init(broker, middlewareHandler, servicesChanged);
    middlewareHandler.init(broker);
    contextFactory.init(broker);
    health.init(broker, broker.transport);
    // Initialize caching module
    if (options.cache.enabled) {
        const createCache = CacheModule.resolve(options.cache.adapter);
        broker.cache = createCache(broker, options.cache);
        broker.cache.init();
        log.info(`Cache module: ${broker.cache.name}`);
    }
    // Initialize tracing module
    if (options.tracing.enabled) {
        broker.tracer = tracing_1.createTracer();
        broker.tracer.init(broker, options.tracing);
    }
    /**
     * Register middlewares
     * @param {Array<Object>} customMiddlewares Array of user defined middlewares
     * @returns {void}
     */
    const registerMiddlewares = (customMiddlewares) => {
        // Register custom middlewares
        if (Array.isArray(customMiddlewares) && customMiddlewares.length > 0) {
            customMiddlewares.forEach(middleware => middlewareHandler.add(middleware));
        }
        // Add the built-in middlewares. (The order is important)
        if (options.loadInternalMiddlewares) {
            middlewareHandler.add(Middlewares.createActionHookMiddleware());
            // Validator middleware
            if (options.validateActionParams && validator) {
                middlewareHandler.add(validator.middleware);
            }
            middlewareHandler.add(Middlewares.createBulkheadMiddleware());
            if (broker.cache) {
                middlewareHandler.add(broker.cache.createMiddleware());
            }
            middlewareHandler.add(Middlewares.createCircuitBreakerMiddleware());
            middlewareHandler.add(Middlewares.createTimeoutMiddleware());
            middlewareHandler.add(Middlewares.createRetryMiddleware());
            middlewareHandler.add(Middlewares.createErrorHandlerMiddleware());
            middlewareHandler.add(Middlewares.createTracingMiddleware());
            if (options.metrics.enabled) {
                middlewareHandler.add(Middlewares.createMetricsMiddleware());
            }
        }
        // Wrap broker methods for middlewares
        broker.call = middlewareHandler.wrapMethod('call', broker.call);
        broker.multiCall = middlewareHandler.wrapMethod('multiCall', broker.multiCall);
        broker.emit = middlewareHandler.wrapMethod('emit', broker.emit);
        broker.broadcast = middlewareHandler.wrapMethod('broadcast', broker.broadcast);
        broker.broadcastLocal = middlewareHandler.wrapMethod('broadcastLocal', broker.broadcastLocal);
        broker.createService = middlewareHandler.wrapMethod('createService', broker.createService);
        broker.loadService = middlewareHandler.wrapMethod('loadService', broker.loadService);
        broker.loadServices = middlewareHandler.wrapMethod('loadServices', broker.loadServices);
    };
    if (utils_1.isFunction(options.beforeRegisterMiddlewares)) {
        options.beforeRegisterMiddlewares.call(broker);
    }
    // Register middlewares
    registerMiddlewares(options.middlewares);
    // Stop the broker greaceful
    const onClose = () => broker.stop()
        .catch(error => broker.log.error(error))
        .then(() => process.exit(0));
    process.setMaxListeners(0);
    process.on('beforeExit', onClose);
    process.on('exit', onClose);
    process.on('SIGINT', onClose);
    process.on('SIGTERM', onClose);
    // Create internal services
    if (options.loadNodeService) {
        broker.createService(require('../services/node.service'));
    }
    // Call middleware hook for broker created.
    middlewareHandler.callHandlersSync('created', [broker]);
    return broker;
}
exports.createBroker = createBroker;
;
