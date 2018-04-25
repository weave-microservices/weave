/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const deps = {
    actionWrapperFactory: require('./action-wrapper.factory'),
    addLocalServiceFactory: require('./add-local-service.factory'),
    broadcastFactory: require('./broadcast.factory.js'),
    bus: require('./bus.factory')(),
    callUtilsFactory: require('./call.factory'),
    defaultOptions: require('./default-options'),
    eventUtilsFactory: require('./event-utils.factory'),
    getNextActionEndpointFactory: require('./get-next-action-endpoint.factory.js'),
    loadServiceFactory: require('./load-service.factory'),
    loadServicesFactory: require('./load-services.factory'),
    localBroadcastFactory: require('./local-broadcast.factory.js'),
    localEventEmitterFactory: require('./local-event-emitter.factory.js'),
    loggerFactory: require('./logger.factory'),
    makeContext: require('./context'),
    makeContextFactory: require('./context.factory'),
    pkg: require('../../package.json'),
    registryFactory: require('../registry'),
    replFactory: require('./repl.factory'),
    serviceChangedFactory: require('./service-changed.factory'),
    serviceCreatorFactory: require('./service-creator.factory.js'),
    serviceFactory: require('../registry/service'),
    serviceWaiterFactory: require('./service-waiter.factory.js'),
    shouldCollectMetricsFactory: require('./should-collect-metrics.factory'),
    startFactory: require('./start.factory'),
    stateFactory: require('./state.factory'),
    statisticFactory: require('../statistics'),
    stopFactory: require('./stop.factory'),
    transportFactory: require('../transportation'),
    useFactory: require('./use.factory'),
    utils: require('../utils'),
    validatorFactory: require('../validator')
}

module.exports = require('./broker.factory')(deps)

// remains temporary for backward compatibility
module.exports.cacher = require('../cacher')
module.exports.transports = require('../transportation/adapters')
