/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { isFunction } = require('lodash')

const stopFactory = ({ state, log, transport, onClose }) =>
    () => {
        return Promise.resolve()
            .then(() => {
                state.services.forEach((service) => {
                    if (isFunction(service.schema.stopped)) {
                        service.schema.stopped.call(service)
                    }
                })
            })
            .catch(error => state.log.error('Unable to stop all services successfull', error))
            .then(() => {
                if (transport) {
                    transport.disconnect()
                }
            })
            .then(() => {
                state.started = false
                log.info(`Node successfully shutted down. Bye bye! `)
                // process.removeListener('beforeExit', onClose)
                // process.removeListener('exit', onClose)
                // process.removeListener('SIGINT', onClose)
            })
    }

module.exports = stopFactory