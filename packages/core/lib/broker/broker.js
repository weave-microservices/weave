/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const TransportAdapters = require('../transport/adapters')

const deps = {
    actionWrapperFactory: require('./_action-wrapper.factory'),
    addLocalServiceFactory: require('./_add-local-service.factory'),
    broadcastFactory: require('./broadcast.factory'),
    bus: require('./bus.factory')(),
    callUtilsFactory: require('./_call.factory'),
    codecFactory: require('../codecs/codec.factory'),
    defaultOptions: require('./default-options'),
    destroyServiceFactory: require('./_destroy-service.factory'),
    Errors: require('../errors'),
    eventUtilsFactory: require('./event-utils.factory'),
    healthFactory: require('./healthcheck'),
    loadServiceFactory: require('./_load-service.factory'),
    loadServicesFactory: require('./load-services.factory'),
    localBroadcastFactory: require('./local-broadcast.factory'),
    localEventEmitterFactory: require('./local-event-emitter.factory'),
    loggerFactory: require('./logger.factory'),
    makeContext: require('./context'),
    makeContextFactory: require('./context.factory'),
    middlewareHandlerFactory: require('./middleware-handler.factory'),
    Middlewares: require('../middlewares'),
    pkg: require('../../package.json'),
    registryFactory: require('../registry'),
    registerLocalServiceFactory: require('./register-local-service.factory'),
    replFactory: require('./repl.factory'),
    resolveCacheFactory: require('../cache/resolve-cache.factory'),
    serviceChangedFactory: require('./service-changed.factory'),
    serviceCreatorFactory: require('./service-creator.factory'),
    serviceFactory: require('../registry/service'),
    serviceWaiterFactory: require('./service-waiter.factory'),
    startFactory: require('./start.factory'),
    stateFactory: require('./state.factory'),
    stopFactory: require('./stop.factory'),
    transportFactory: require('../transport'),
    TransportAdapters,
    utils: require('../utils'),
    validatorFactory: require('./validator.factory'),
    watchServiceFactory: require('./watch-service.factory')
}

module.exports = require('./broker.factory')(deps)
module.exports.cache = require('../cache')
module.exports.TransportAdapters = TransportAdapters
