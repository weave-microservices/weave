const { defaultsDeep, isString, isFunction } = require('lodash')
const glob = require('glob')
const path = require('path')
const Cachers = require('../cacher')

const makeBroker = ({
    actionWrapperFactory,
    addLocalServiceFactory,
    broadcastFactory,
    bus,
    callUtilsFactory,
    defaultOptions,
    eventUtilsFactory,
    getNextActionEndpointFactory,
    localBroadcastFactory,
    localEventEmitterFactory,
    loggerFactory,
    makeContext,
    makeContextFactory,
    pkg,
    registryFactory,
    replFactory,
    serviceCreatorFactory,
    serviceFactory,
    serviceWaiterFactory,
    shouldCollectMetricsFactory,
    startFactory,
    stateFactory,
    stopFactory,
    transportFactory,
    useFactory,
    utils,
    validatorFactory
}) => {
    return options => {
        options = defaultsDeep(options, defaultOptions)

        const state = stateFactory({ pkg, createId: utils.createId })(options)
        // state.use = use
        const getLogger = loggerFactory({ state, options })

        const log = state.log = getLogger('WEAVE')

        log.info(`Init #weave node '${state.nodeId}' version ${state.version}`)

        const use = useFactory({ state, onClose })
        const metricsChecker = shouldCollectMetricsFactory({ state, options })

        // const  { call, emit, use } = makeBrokerUtils()

        const wrapAction = actionWrapperFactory({ state })
        const registry = registryFactory({
            state,
            getLogger,
            bus
        })
        const getNextActionEndpoint = getNextActionEndpointFactory({ registry })

        const localEventEmitter = localBroadcastFactory({ registry })

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
            shouldCollectMetrics: metricsChecker
        })

        const { setEventTransport, emit } = eventUtilsFactory({
            state,
            registry
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

        const start = startFactory({ state, log, transport })
        const stop = stopFactory({ state, log, transport })

        const repl = replFactory({ state, log, call, start, stop, registry })

        const addLocalService = addLocalServiceFactory({ state, registry })

        state.localEventBus = bus

        // if (options.statistics) {
        //     state.statistics = Statistics(state)
        // }
        let validator
        if (options.validate) {
            validator = validatorFactory({ state, use })
        }

        if (options.cacher) {
            const cacheAdapter = resolveCacher(options.cacher)
            // state.cacher = resolveCacher(options.cacher)
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

        const makeNewService = serviceFactory({ state, cacher: state.cacher, call, emit, getNextActionEndpoint, log, getLogger, validator, registry, wrapAction, contextFactory, addLocalService, waitForServices })
        const createService = serviceCreatorFactory({ state, makeNewService })

        if (options.internalActions) {
            createService(require('../internals'))
        }

        return {
            getNextActionEndpoint,
            /**
             * Create a new service by schema
             * @param {object} schema	Schema of service
             * @returns {Service} New Service
             * @memberOf state
             */
            createService,
            loadService (fileName) {
                const filePath = path.resolve(fileName)
                const schema = require(filePath)
                this.createService(schema)
                return schema
            },
            /**
             * Load services from a folder
             * @param {string} folder	Folder
             * @param {string} fileMask	Schema of service
             * @returns {Number} Number of service files found
             * @memberOf state
             */
            loadServices (folder = './services', fileMask = '*.service.js') {
                state.log.info(`Search services in ${folder}/${fileMask}`)
                const serviceFiles = glob.sync(path.join(folder, fileMask))
                serviceFiles.forEach(fileName => this.loadService(fileName))
                return serviceFiles.length
            },
            repl,
            start,
            /**
             * Stop all services and transporters.
             * @returns {Promise} Promise when everithing is stopped.
             */
            stop,
            /**
             * Call an action by action name with given parameters.
             * @param {any} actionName Name of the action.
             * @param {any} params Parameters as a object.
             * @param {any} [opts={}] Options
             * @returns {Primise} Promise with the result from the called action.
             */
            call,
            use,
            /**
             * Emit a event on all listeners.
             * @param {any} eventName Name of the event
             * @param {any} payload Payload
             * @param {any} sender SenderId
             * @return {void}
             */
            emit,
            broadcast,
            log,
            waitForServices
        }

        // base.broadcastLocal = (eventName, payload) => {
        //     return state.registry.events.emitLocal(eventName, payload)
        // }
        // /**
        //  * Emit a event only on local node.
        //  * @param {any} eventName Name of the event
        //  * @param {any} payload Payload
        //  * @param {any} sender SenderId
        //  * @return {void}
        //  */
        // base.emitLocal = function (eventName, payload, sender) {
        //     state.log.debug('Event emitted: ' + eventName)
        //     state.localEventBus.emit(eventName, payload, sender)
        // }

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
