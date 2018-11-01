/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const deps = {
    actionWrapperFactory: require('./action-wrapper.factory'),
    addLocalServiceFactory: require('./add-local-service.factory'),
    broadcastFactory: require('./broadcast.factory'),
    bus: require('./bus.factory')(),
    callUtilsFactory: require('./call.factory'),
    defaultOptions: require('./default-options'),
    destroyServiceFactory: require('./destroy-service.factory'),
    eventUtilsFactory: require('./event-utils.factory'),
    Errors: require('../errors'),
    healthFactory: require('./health.factory'),
    loadServiceFactory: require('./load-service.factory'),
    loadServicesFactory: require('./load-services.factory'),
    localBroadcastFactory: require('./local-broadcast.factory'),
    localEventEmitterFactory: require('./local-event-emitter.factory'),
    loggerFactory: require('./logger.factory'),
    makeContext: require('./context'),
    makeContextFactory: require('./context.factory'),
    Middlewares: require('../middlewares'),
    middlewareHandlerFactory: require('./middleware-handler.factory'),
    pkg: require('../../package.json'),
    registryFactory: require('../registry'),
    replFactory: require('./repl.factory'),
    resolveCacheFactory: require('../cache/resolve-cache.factory'),
    serializerFactory: require('../serializers/serializer.factory'),
    serviceChangedFactory: require('./service-changed.factory'),
    serviceCreatorFactory: require('./service-creator.factory'),
    serviceFactory: require('../registry/service'),
    serviceWaiterFactory: require('./service-waiter.factory'),
    startFactory: require('./start.factory'),
    stateFactory: require('./state.factory'),
    stopFactory: require('./stop.factory'),
    transportFactory: require('../transportation'),
    utils: require('../utils'),
    validatorFactory: require('../validator'),
    watchServiceFactory: require('./watch-service.factory')
}

module.exports = require('./broker.factory')(deps)
module.exports.cacher = require('../cache')
module.exports.transports = require('../transportation/adapters')
