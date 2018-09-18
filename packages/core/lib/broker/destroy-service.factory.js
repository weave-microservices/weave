/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const destroyServiceFactory = ({ state, log, registry }) =>
    service => {
        return Promise.resolve()
            .then(() => service.stop())
            .catch(error => log.error(`Unable to stop ${service.name} service`, error))
            .then(() => {
                registry.unregisterService(service.name, service.version)
                log.info(`Service ${service.name} was stopped.`)
                state.services.splice(state.services.indexOf(service), 1)
                return Promise.resolve()
            })
    }

module.exports = destroyServiceFactory
