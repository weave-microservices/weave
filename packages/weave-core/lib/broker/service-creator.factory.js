/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const serviceCreatorFactory = ({ state, makeNewService, log }) =>
    schema => {
        // add plugin
        try {
            const newService = makeNewService(schema)
            if (state.isStarted) {
                newService.start()
                    .catch(error => state.log.error(`Unable to start service ${newService.name}: ${error}`))
            }
            return newService
        } catch (error) {
            log.error(error)
        }
    }

module.exports = serviceCreatorFactory
