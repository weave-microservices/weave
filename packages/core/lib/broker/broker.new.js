/**
 * Weave service Broker.
 * @module weave2
 */

// npm packages
const { defaultsDeep } = require('lodash')
const path = require('path')
const fs = require('fs')
const { debounce } = require('fachwork')
const glob = require('glob')

/**
 * Configuration object for weave service broker.
 * @typedef {Object} BrokerInstance
 * @property {function():Promise} start - Start the broker, spin up all services and connect transports..
 * @property {function():Promise} stop - Codec for data serialization.
 * @property {function(moduleName, serviceSettings):Logger} createLogger - Create a new Logger.
 * @property {Function} createService - Creates and registers a new service with the given schema.
 * @property {Function} loadService - Indicates whether the Wisdom component is present.
 * @property {Function} loadServices - Indicates whether the Wisdom component is present.
 * @property {Function} waitForService - Indicates whether the Wisdom component is present.
 * @property {Function} emit - Indicates whether the Wisdom component is present.
 * @property {Logger} broadcast - Indicates whether the Wisdom component is present.
 * @property {Function} log - Indicates whether the Wisdom component is present.
 */

// own packages
const defaultOptions = require('./default-options')
const Logger = require('../logger')
const createServiceFromSchema = require('../registry/service')
const utils = require('../utils')
const createMiddlewareHandler = require('./middleware-handler.factory')
const createRegistry = require('../registry/registry')
const createContextFactory = require('./context.factory')
const Middlewares = require('../middlewares')
const createValidator = require('./validator.factory')
const Cache = require('../cache')
const createHealthcheck = require('./healthcheck')
const TransportAdapters = require('../transport/adapters')
const createTransport = require('../transport')
const EventEmitter = require('eventemitter2')
const { WeaveError } = require('../errors')

// package.json
const pkg = require('../../package.json')

/**
 *  Creates a new Weave instance
 * @param {import('./default-options.js').BrokerOptions} options - Service broker options.
 */
const createBroker = (options) => {
    // merge options with default options
    options = defaultsDeep(options, defaultOptions)

    if (options.started && typeof options.started !== 'function') {
        throw new WeaveError('Started hook have to be a function.')
    }

    if (options.stopped && typeof options.stopped !== 'function') {
        throw new WeaveError('Stopped hook have to be a function.')
    }

    // if no node id is set - create one.
    const nodeId = options.nodeId || utils.createNodeId()
    // Set version to pakage version
    const version = pkg.version
    const services = []

    /**
     * Create a new Logger.
     * @param {string} moduleName - Name of the module
     * @param {*} service - Service properties
     * @returns {import('../logger.js').Logger} Logger
     */
    const createLogger = (moduleName, service) => {
        const bindings = {
            nodeId: nodeId
        }

        if (service) {
            bindings.service = service
            if (service.version) {
                bindings.version = service.version
            }
        } else {
            bindings.logName = moduleName
        }

        return Logger.createDefaultLogger(options.logger, bindings, options.logLevel)
    }

    // create the default logger for the broker.
    const log = createLogger('WEAVE')

    // internal modules
    const middlewareHandler = createMiddlewareHandler()
    const registry = createRegistry(middlewareHandler, nodeId, options, createLogger)
    const contextFactory = createContextFactory()
    const health = createHealthcheck()
    const validator = createValidator()

    // internal Methods
    const addLocalServices = service => {
        services.push(service)
    }

    const servicesChanged = notify => {
        // broadcastLocal
        // if transport -> send to nodes
    }

    const registerLocalService = (registryItem, notify = false) => {
        registry.registerLocalService(registryItem)
        servicesChanged(notify)
    }

    const serviceWatcher = function (service, onServiceChanged) {
        if (service.filename && onServiceChanged) {
            const debouncedOnServiceChange = debounce(onServiceChanged, 500)
            const watcher = fs.watch(service.filename, (eventType, filename) => {
                log.info(`The Service ${service.name} has been changed. ${eventType}`)
                watcher.close()
                debouncedOnServiceChange(this, service)
            })
        }
    }

    const destroyService = service => Promise.resolve()
        .then(() => service.stop())
        .then(() => {
            registry.unregisterService(service.name, service.version)
            log.info(`Service ${service.name} was stopped.`)
            // remove service from service store.
            services.splice(services.indexOf(service), 1)
            // fire services changed event
            servicesChanged(true)
            return Promise.resolve()
        })
        .catch(error => log.error(`Unable to stop ${service.name} service`, error))

    const onServiceChanged = (broker, service) => {
        const filename = service.filename

        // Clear the require cache
        Object.keys(require.cache).forEach(key => {
            if (key === filename) {
                delete require.cache[key]
            }
        })
        // service has changed - 1. destroy the service, then reload it
        destroyService(service)
            .then(() => broker.loadService(filename))
    }

    // Log Messages
    log.info(`Initializing #weave node version ${version}`)
    log.info(`Node Id: ${nodeId}`)

    if (options.namespace) {
        log.info(`Namespace: ${options.namespace}`)
    }

    // broker object
    const broker = {
        /**
         * Event bus
         * @returns {EventEmitter} Service object.
         */
        bus: new EventEmitter({
            wildcard: true,
            maxListeners: 1000
        }),
        version,
        options,
        nodeId,
        isStarted: false,
        log,
        createLogger,
        health,
        registry,
        /**
         * Call a action.
         * @param {*} actionName Name of the action.
         * @param {*} params Action parameters
         * @param {*} [opts={}] Options
         * @returns {Promise} Promise
         */
        call (actionName, params, opts = {}) {
            const endpoint = registry.getNextAvailableActionEndpoint(actionName, opts)

            if (endpoint instanceof Error) {
                return Promise.reject(endpoint)
            }

            const action = endpoint.action
            const nodeId = endpoint.node.id
            let context

            if (opts.context !== undefined) {
                context = opts.context
                context.nodeId = nodeId
            } else {
                context = contextFactory.create(action, nodeId, params, opts, endpoint)
            }

            if (endpoint.isLocal) {
                log.debug(`Call action local.`, { action: actionName, requestId: context.requestId })
            } else {
                log.debug(`Call action on remote node.`, { action: actionName, nodeId, requestId: context.requestId })
            }

            const p = action.handler(context)
            p.context = context

            return p
        },
        emit (eventName, payload, groups) {
            if (groups && !Array.isArray(groups)) {
                groups = [groups]
            }

            // emit system events
            if (/^\$/.test(eventName)) {
                this.bus.emit(eventName, payload)
            }

            const endpoints = registry.events.getBalancedEndpoints(eventName, groups)
            const groupedEndpoints = {}

            endpoints.map(([endpoint, groupName]) => {
                if (endpoint) {
                    if (endpoint.node.id === this.nodeId) {
                        // Local event. Call handler
                        endpoint.action.handler(payload, endpoint.node.id, eventName)
                    } else {
                        const e = groupedEndpoints[endpoint.node.id]
                        if (e) {
                            e.push(groupName)
                        } else {
                            groupedEndpoints[endpoint.node.id] = [groupName]
                        }
                    }
                }
            })

            if (this.transport) {
                this.transport.sendBalancedEvent(eventName, payload, groupedEndpoints)
            }
        },
        broadcast (eventName, payload, groups = null) {
            if (this.transport) {
                // avoid to broadcast internal events.
                if (!/^\$/.test(eventName)) {
                    const endpoints = registry.events.getAllEndpointsUniqueNodes(eventName, groups)
                    if (endpoints) {
                        endpoints.map(endpoint => {
                            if (endpoint.node.id !== this.nodeId) {
                                if (this.transport) {
                                    this.transport.sendBroadcastEvent(endpoint.node.id, eventName, payload, groups)
                                }
                            }
                        })
                    }
                }
            }
            return this.broadcastLocal(eventName, payload, groups)
        },
        broadcastLocal (eventName, payload, groups = null) {
            if (groups && !Array.isArray(groups)) {
                groups = [groups]
            }
            registry.events.emitLocal(eventName, payload, this.nodeId, groups, true)
        },
        /**
         * Create a new Service and add it to the registry
         * @param {import('../registry/service.js').ServiceSchema} schema - Schema of the Service
         * @returns {Service} Service object.
         */
        createService (schema) {
            try {
                const newService = createServiceFromSchema(this, middlewareHandler, addLocalServices, registerLocalService, schema)

                // if the broker is already startet - start the service.
                if (this.isStarted) {
                    newService.start()
                        .catch(error => log.error(`Unable to start service ${newService.name}: ${error}`))
                }
                return newService
            } catch (error) {
                log.error(error)
            }
        },
        /**
         * Load and register a service from file.
         * @param {string} fileName Path to the service file.
         * @returns {Service} Service
         */
        loadService (fileName) {
            const filePath = path.resolve(fileName)
            const schema = require(filePath)
            const service = this.createService(schema)

            // if the "watchSevrices" option is set - add service to service watcher.
            if (options.watchServices) {
                service.filename = fileName
                serviceWatcher.call(this, service, onServiceChanged)
            }
            return service
        },
        /**
         * Load services from a folder.
         * @param {string} [folder='./services'] Path of the folder.
         * @param {string} [fileMask='*.service.js'] Pattern of the service files
         * @returns {number} Amount of services
         */
        loadServices (folder = './services', fileMask = '*.service.js') {
            this.log.info(`Searching services in folder '${folder}' with name pattern '${fileMask}'.`)
            const serviceFiles = glob.sync(path.join(folder, fileMask))
            this.log.info(`${serviceFiles.length} services found.`)
            serviceFiles.forEach(fileName => this.loadService(fileName))
            return serviceFiles.length
        },
        /**
         * Wait for services before continuing startup.
         * @param {Array.<string>} serviceNames Names of the services
         * @param {Number} timeout Time in Miliseconds before the broker stops.
         * @param {Number} interval Time in Miliseconds to check for services.
         * @returns {Promise} Promise
         */
        waitForServices (serviceNames, timeout, interval) {
            if (typeof serviceNames === 'string') {
                serviceNames = [serviceNames]
            }
            return new Promise((resolve, reject) => {
                this.log.info(`Waiting for services '${serviceNames.join(',')}'`)
                const serviceCheck = () => {
                    if (!Array.isArray(serviceNames)) {
                        serviceNames = [serviceNames]
                    }
                    const count = serviceNames.filter(serviceName => registry.hasService(serviceName))
                    this.log.debug(`${count.length} services of ${serviceNames.length} available. Waiting...`)

                    if (count.length === serviceNames.length) {
                        return resolve()
                    }
                    this.options.waitForServiceInterval = setTimeout(serviceCheck, interval || 500)
                }
                serviceCheck()
            })
        },
        /**
         * Starts the broker.
         * @returns {Promise} Promise
         */
        start () {
            return Promise.resolve()
                .then(() => middlewareHandler.callHandlersAsync('starting', [this], true))
                .then(() => {
                    if (this.transport) {
                        return this.transport.connect()
                    }
                })
                .then(() => Promise.all(services.map(service => service.start())))
                .catch(error => {
                    this.log.error('Unable to start all services', error)
                    clearInterval(options.waitForServiceInterval)
                    return Promise.reject(error)
                })
                .then(() => {
                    this.isStarted = true
                    log.info(`Weave service node with ${services.length} services is started successfully.`)
                    this.broadcastLocal('$broker.started')
                })
                .then(() => {
                    if (this.transport) {
                        return this.transport.setReady()
                    }
                })
                .then(() => middlewareHandler.callHandlersAsync('started', [this], true))
                .then(() => {
                    if (this.isStarted && options.started) {
                        options.started.call(this)
                    }
                })
        },
        /**
         * Stops the broker.
         * @returns {Promise} Promise
         */
        stop () {
            this.isStarted = false
            return Promise.resolve()
                .then(() => middlewareHandler.callHandlersAsync('stopping', [this], true))
                .then(() => Promise.all(services.map(service => service.stop())))
                .catch(error => {
                    this.log.error('Unable to stop all services.', error)
                    return Promise.reject(error)
                })
                .then(() => {
                    if (this.transport) {
                        return this.transport.disconnect()
                    }
                })
                .then(() => middlewareHandler.callHandlersAsync('stopped', [this], true))
                .then(() => {
                    if (!this.isStarted) {
                        if (options.stopped) {
                            options.stopped.call(this)
                        }
                    }
                })
                .then(() => {
                    log.info(`Node successfully shutted down. Bye bye!`)

                    this.broadcastLocal('$broker.closed')

                    process.removeListener('beforeExit', onClose)
                    process.removeListener('exit', onClose)
                    process.removeListener('SIGINT', onClose)
                    process.removeListener('SIGTERM', onClose)
                })
        }
    }

    // Resolve the transport adapter
    if (options.transport) {
        const adapter = TransportAdapters.resolve(options.transport)
        if (adapter) {
            broker.transport = createTransport(broker, adapter)
        }
    }

    // module initialisation
    registry.init(broker, middlewareHandler)
    middlewareHandler.init(broker)
    contextFactory.init(broker)
    health.init(broker, broker.transport) 
    // register all middlewares (including user defined)


    // initialize caching module
    if (options.cache) {
        const createCache = Cache.resolve(options.cache)
        broker.cache = createCache(broker, options.cache)
        middlewareHandler.add(broker.cache.middleware)
        log.info(`Cache module: ${broker.cache.name}`)
    }

    const registerMiddlewares = customMiddlewares => {
        // Register custom middlewares
        if (Array.isArray(customMiddlewares) && customMiddlewares.length > 0) {
            customMiddlewares.forEach(middleware => middlewareHandler.add(middleware))
        }

        // Add the built-in middleware. (The order is important)

        if (options.loadInternalMiddlewares) {
            middlewareHandler.add(Middlewares.ActionHooks())

            // validator middleware
            if (options.validate && validator) {
                middlewareHandler.add(validator.middleware)
            }

            middlewareHandler.add(Middlewares.Bulkhead())
            middlewareHandler.add(Middlewares.CircuitBreaker())
            middlewareHandler.add(Middlewares.Timeout())
            middlewareHandler.add(Middlewares.Retry())
            middlewareHandler.add(Middlewares.ErrorHandler())
            middlewareHandler.add(Middlewares.Metrics())
        }

        // Wrap broker methods
        broker.call = middlewareHandler.wrapMethod('call', broker.call)
        broker.emit = middlewareHandler.wrapMethod('emit', broker.emit)
        broker.broadcast = middlewareHandler.wrapMethod('broadcast', broker.broadcast)
        broker.createService = middlewareHandler.wrapMethod('createService', broker.createService)
    }
    registerMiddlewares(options.middlewares)

    // Stop the broker greaceful
    const onClose = () => broker.stop()
        .catch(error => broker.log.error(error))
        .then(() => process.exit(0))

    process.setMaxListeners(0)
    process.on('beforeExit', onClose)
    process.on('exit', onClose)
    process.on('SIGINT', onClose)
    process.on('SIGTERM', onClose)

    // Create internal services
    if (options.internalActions) {
        broker.createService(require('../services/node.service')(broker))
    }

    registry.onRegisterLocalAction = action => {
        return middlewareHandler.wrapHandler('localAction', action.handler, action)
    }

    registry.onRegisterRemoteAction = action => {
        return middlewareHandler.wrapHandler('remoteAction', broker.transport.request.bind(broker.transport), action)
    }

    // call middleware hook for broker created.
    middlewareHandler.callHandlersSync('created', broker)

    return broker
}

module.exports = createBroker
