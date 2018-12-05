/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { defaultsDeep } = require('lodash')
const Cache = require('../cache')

const makeBroker = ({
    actionWrapperFactory,
    addLocalServiceFactory,
    broadcastFactory,
    bus,
    callUtilsFactory,
    codecFactory,
    defaultOptions,
    destroyServiceFactory,
    Errors,
    eventUtilsFactory,
    healthFactory,
    loadServiceFactory,
    loadServicesFactory,
    localBroadcastFactory,
    localEventEmitterFactory,
    loggerFactory,
    makeContext,
    makeContextFactory,
    middlewareHandlerFactory,
    Middlewares,
    pkg,
    registryFactory,
    replFactory,
    resolveCacheFactory,
    serviceChangedFactory,
    serviceCreatorFactory,
    serviceFactory,
    serviceWaiterFactory,
    startFactory,
    stateFactory,
    stopFactory,
    transportFactory,
    TransportAdapters,
    utils,
    watchServiceFactory
}) => {
    /**
     * Creates an weave broker. The Weave() function is a top-level function exported by the weave module.
     * @param {Object} options Weave configuration object.
     * @returns {Weave} Weave
     */
    return function Weave (options) {
        options = defaultsDeep(options, defaultOptions)

        let statistics
        let transport

        const state = stateFactory({ pkg, createId: utils.createNodeId, Errors })(options)
        const getLogger = loggerFactory({ state, options })
        const middlewareHandler = middlewareHandlerFactory({ state, getLogger })()
        const codec = codecFactory({ getLogger, options })
        const log = state.log = getLogger('WEAVE')

        log.info(`Initializing #weave node version ${state.version}`)
        log.info(`Node Id: ${state.nodeId}`)

        if (state.namespace) {
            log.info(`Namespace: ${state.namespace}`)
        }

        const wrapAction = actionWrapperFactory({ state })
        const registry = registryFactory({
            bus,
            Errors,
            getLogger,
            middlewareHandler,
            state
        })

        const localEventEmitter = localEventEmitterFactory({ registry })

        const waitForServices = serviceWaiterFactory({
            log,
            registry,
            state
        })

        const {
            call,
            setContextFactory
        } = callUtilsFactory({
            log,
            options,
            registry,
            state,
            statistics
        })

        const {
            emit,
            setEventTransport
        } = eventUtilsFactory({
            bus,
            registry,
            state
        })

        const broadcastLocal = localBroadcastFactory({
            state,
            registry
        })
        const { broadcast, setBroadcastTransport } = broadcastFactory({
            state,
            registry,
            broadcastLocal
        })

        const Context = makeContext({ state, options, call, emit, broadcast, Errors })
        const contextFactory = makeContextFactory({
            state,
            Context
        })

        setContextFactory(contextFactory)

        if (options.transport) {
            const adapter = TransportAdapters.resolve(options.transport)
            if (adapter) {
                transport = transportFactory({
                    bus,
                    call,
                    codec,
                    Context,
                    contextFactory,
                    Errors,
                    getLogger,
                    localEventEmitter, // todo: check if realy neaded
                    options,
                    registry,
                    state,
                    adapter
                })
            }
        }

        registry.getTransport = () => {
            return transport
        }

        setEventTransport(transport)
        setBroadcastTransport(transport)

        const health = healthFactory({ state, transport })
        const servicesChanged = serviceChangedFactory({ state, transport, broadcastLocal })
        const stop = stopFactory({ state, log, transport, middlewareHandler })
        const start = startFactory({ state, log, transport, middlewareHandler, stop, call, emit, broadcast })
        const repl = replFactory({ state, log, call, health, start, stop, registry, statistics })
        const addLocalService = addLocalServiceFactory({ state, registry, servicesChanged })

        let validator

        const resolveCache = resolveCacheFactory({ options, Cache, Errors })

        const cache = resolveCache(options.cache)

        if (cache) {
            state.cache = cache
            state.cache.init({ state, getLogger, bus, options, middlewareHandler })
            log.info(`Cache module: ${cache.name}`)
        }

        function onClose () {
            stop().then(() => process.exit(0))
        }

        process.setMaxListeners(0)
        process.on('beforeExit', onClose)
        process.on('exit', onClose)
        process.on('SIGINT', onClose)

        const makeNewService = serviceFactory({ state, cache, call, emit, broadcast, broadcastLocal, health, log, getLogger, validator, registry, wrapAction, middlewareHandler, contextFactory, addLocalService, waitForServices, statistics })
        const createService = serviceCreatorFactory({ state, makeNewService, log })
        const destroyService = destroyServiceFactory({ state, log, registry, servicesChanged })
        const serviceWatcher = watchServiceFactory({ log })
        const loadService = loadServiceFactory({ createService, servicesChanged, serviceWatcher, options })
        const loadServices = loadServicesFactory({ log, loadService })

        serviceWatcher.onServiceChanged = (service) => {
            const filename = service.filename

            // clear the require cache
            Object.keys(require.cache).forEach(key => {
                if (key === filename) {
                    delete require.cache[key]
                }
            })
            destroyService(service)
                .then(() => loadService(filename))
        }

        const broker = {
            broadcast,
            call,
            contextFactory,
            createService,
            emit,
            getLogger,
            getNextAvailableActionEndpoint: registry.getNextAvailableActionEndpoint,
            health,
            loadService,
            loadServices,
            log,
            nodeId: state.nodeId,
            options: state.options,
            registry,
            repl,
            start,
            state,
            statistics,
            stop,
            transport,
            validator,
            waitForServices
        }

        middlewareHandler.init(broker)

        function registerMiddlewares (customMiddlewares) {
            if (Array.isArray(customMiddlewares) && customMiddlewares.length > 0) {
                customMiddlewares.forEach(middleware => middlewareHandler.add(middleware))
            }

            if (options.loadInternalMiddlewares) {
                // Add the built-in middleware. (The order is important)
                if (options.validate && validator) {
                    middlewareHandler.add(validator.middleware())
                }

                middlewareHandler.add(Middlewares.ActionHooks())
                middlewareHandler.add(Middlewares.CircuitBreaker())
                middlewareHandler.add(Middlewares.Timeout())
                middlewareHandler.add(Middlewares.Retry())
                middlewareHandler.add(Middlewares.ErrorHandler())
                middlewareHandler.add(Middlewares.Metrics())
            }
        }

        registerMiddlewares(options.middlewares)
        middlewareHandler.callHandlersSync('brokerCreated', broker)

        if (options.internalActions) {
            createService(require('../services/node.service')({ state, health, transport }))
        }

        if (options.statistics) {
            createService(require('../services/statistic.service')({ state }))
        }

        registry.on('node.connected', payload => broadcastLocal('$node.connected', payload))
        registry.on('node.updated', payload => broadcastLocal('$node.updated', payload))
        registry.on('node.disconnected', (nodeId, isUnexpected) => {
            broadcastLocal('$node.disconnected', { nodeId, isUnexpected })
            transport.removePendingRequestsByNodeId(nodeId)
            servicesChanged(false)
        })

        return broker
    }
}

module.exports = makeBroker
