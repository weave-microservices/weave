/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const stopFactory = ({ state, call, broadcast, emit, log, transport, middlewareHandler }) =>
    () => {
        state.isStarted = false
        return Promise.resolve()
            .then(() => middlewareHandler.callHandlersAsync('stopping', [{ state, call, broadcast, emit, log }], true))
            .then(() => Promise.all(state.services.map(service => service.stop())))
            .catch(error => state.log.error('Unable to stop all services.', error))
            .then(() => {
                if (transport) {
                    return transport.disconnect()
                }
            })
            .then(() => middlewareHandler.callHandlersAsync('stopped', [{ state, call, broadcast, emit, log }], true))
            .then(() => {
                if (!state.isStarted) {
                    if (state.options.stopped) {
                        state.options.stopped.call(state)
                    }
                }
            })
            .then(() => {
                log.info(`Node successfully shutted down. Bye bye!`)
            })
    }

module.exports = stopFactory
