/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const destroyServiceFactory = ({ state, log, registry, servicesChanged }) =>
    service => {
        return Promise.resolve()
            .then(() => service.stop())
            .then(() => {
                registry.unregisterService(service.name, service.version)
                log.info(`Service ${service.name} was stopped.`)
                state.services.splice(state.services.indexOf(service), 1)
                servicesChanged(true)
                return Promise.resolve()
            })
            .catch(error => log.error(`Unable to stop ${service.name} service`, error))
    }

module.exports = destroyServiceFactory
