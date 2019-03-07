/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const TransportAdapters = require('../transport/adapters')

const deps = {
    actionWrapperFactory: require('./_action-wrapper.factory'),
    addLocalServiceFactory: require('./_add-local-service.factory'),
    broadcastFactory: require('./_broadcast.factory'),
    bus: require('./_bus.factory')(),
    callUtilsFactory: require('./_call.factory'),
    codecFactory: require('../codecs/codec.factory'),
    defaultOptions: require('./default-options'),
    destroyServiceFactory: require('./_destroy-service.factory'),
    Errors: require('../errors'),
    eventUtilsFactory: require('./_event-utils.factory'),
    healthFactory: require('./healthcheck'),
    loadServiceFactory: require('./_load-service.factory'),
    loadServicesFactory: require('./load-services.factory'),
    localBroadcastFactory: require('./local-broadcast.factory'),
    localEventEmitterFactory: require('./local-event-emitter.factory'),
    loggerFactory: require('./logger.factory'),
    makeContext: require('./context'),
    makeContextFactory: require('./context.factory'),
    middlewareHandlerFactory: require('./middleware-handler'),
    Middlewares: require('../middlewares'),
    pkg: require('../../package.json'),
    registryFactory: require('../registry'),
    registerLocalServiceFactory: require('./_register-local-service.factory'),
    replFactory: require('./_repl.factory'),
    resolveCacheFactory: require('../cache/resolve-cache.factory'),
    serviceChangedFactory: require('./_service-changed.factory'),
    serviceCreatorFactory: require('./_service-creator.factory'),
    serviceFactory: require('../registry/service'),
    serviceWaiterFactory: require('./_service-waiter.factory'),
    startFactory: require('./_start.factory'),
    stateFactory: require('./_state.factory'),
    stopFactory: require('./_stop.factory'),
    transportFactory: require('../transport'),
    TransportAdapters,
    utils: require('../utils'),
    validatorFactory: require('./validator'),
    watchServiceFactory: require('./_watch-service.factory')
}

module.exports = require('./_broker.factory')(deps)
module.exports.cache = require('../cache')
module.exports.TransportAdapters = TransportAdapters
