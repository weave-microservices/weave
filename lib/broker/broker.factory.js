/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { defaultsDeep, isString, isFunction } = require('lodash')
const Cachers = require('../cacher')

const makeBroker = ({
    actionWrapperFactory,
    addLocalServiceFactory,
    broadcastFactory,
    bus,
    callUtilsFactory,
    defaultOptions,
    eventUtilsFactory,
    Errors,
    getNextActionEndpointFactory,
    loadServiceFactory,
    loadServicesFactory,
    localBroadcastFactory,
    localEventEmitterFactory,
    loggerFactory,
    makeContext,
    makeContextFactory,
    pkg,
    registryFactory,
    replFactory,
    serviceChangedFactory,
    serviceCreatorFactory,
    serviceFactory,
    serviceWaiterFactory,
    shouldCollectMetricsFactory,
    startFactory,
    stateFactory,
    statisticFactory,
    stopFactory,
    transportFactory,
    useFactory,
    utils,
    validatorFactory
}) => {
    return options => {
        options = defaultsDeep(options, defaultOptions)

        let statistics

        if (options.statistics) {
            statistics = statisticFactory({ options })
        }

        const state = stateFactory({ pkg, createId: utils.createId })(options)
        const getLogger = loggerFactory({ state, options })

        const log = state.log = getLogger('WEAVE')

        log.info(`Init #weave node '${state.nodeId}' version ${state.version}`)

        const use = useFactory({ state, onClose })
        const metricsChecker = shouldCollectMetricsFactory({ state, options })

        const wrapAction = actionWrapperFactory({ state })
        const registry = registryFactory({
            state,
            getLogger,
            bus
        })

        const getNextActionEndpoint = getNextActionEndpointFactory({ registry })

        const localEventEmitter = localEventEmitterFactory({ registry }) // localBroadcastFactory({ state, registry })

        const waitForServices = serviceWaiterFactory({
            state,
            log,
            registry
        })

        const { setCallTransport, setContextFactory, call, localCall } = callUtilsFactory({
            state,
            log,
            options,
            registry,
            shouldCollectMetrics: metricsChecker,
            statistics
        })

        const { setEventTransport, emit } = eventUtilsFactory({
            state,
            registry,
            bus
        })

        const Context = makeContext({ state, options, call, emit })
        const contextFactory = makeContextFactory({ state,
            Context,
            shouldCollectMetrics: metricsChecker
        })

        setContextFactory(contextFactory)

        const transport = options.transport ? transportFactory({
            state,
            bus,
            Errors,
            getLogger,
            localEventEmitter, // realy needed? methode einfach und auch über registry zu erreichen.
            localCall,
            registry,
            options,
            transport: options.transport,
            contextFactory
        }) : null

        setCallTransport(transport)
        setEventTransport(transport)

        const broadcastLocal = localBroadcastFactory({
            state,
            registry
        })
        const broadcast = broadcastFactory({
            state,
            registry,
            transport,
            broadcastLocal
        })

        const servicesChanged = serviceChangedFactory({ transport, broadcastLocal })

        const start = startFactory({ state, log, transport })
        const stop = stopFactory({ state, log, transport })

        const repl = replFactory({ state, log, call, start, stop, registry, statistics })

        const addLocalService = addLocalServiceFactory({ state, registry })

        // if (options.statistics) {
        //     state.statistics = Statistics(state)
        // }
        let validator
        if (options.validate) {
            validator = validatorFactory({ use })
        }

        if (options.cacher) {
            const cacheAdapter = resolveCacher(options.cacher)
            if (cacheAdapter) {
                if (!isFunction(cacheAdapter)) {
                    state.cacher = cacheAdapter
                } else {
                    state.cacher = cacheAdapter()
                }
                state.cacher.init({ state, use, getLogger, bus, options })
            }
        }

        function onClose () {
            stop().then(() => process.exit(0))
        }

        process.setMaxListeners(0)
        process.on('beforeExit', onClose)
        process.on('exit', onClose)
        process.on('SIGINT', onClose)

        const makeNewService = serviceFactory({ state, cacher: state.cacher, call, emit, getNextActionEndpoint, log, getLogger, validator, registry, wrapAction, contextFactory, addLocalService, waitForServices, statistics })
        const createService = serviceCreatorFactory({ state, makeNewService })

        const loadService = loadServiceFactory({ createService, servicesChanged })
        const loadServices = loadServicesFactory({ log, loadService })

        if (options.internalActions) {
            createService(require('../services/internals')({ state }))
        }

        return {
            getNextActionEndpoint,
            createService,
            loadService,
            loadServices,
            repl,
            start,
            stop,
            call,
            use,
            emit,
            broadcast,
            log,
            waitForServices
        }

        function resolveCacher (option) {
            if (isString(option)) {
                const CacherFactory = Cachers[option]
                if (CacherFactory) {
                    return CacherFactory
                }
            } else if (option === true) {
                return Cachers.Memory
            } else { // check for option
                return option
            }
        }
    }
}

module.exports = makeBroker
