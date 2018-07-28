/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const startFactory = ({ state, log, transport, middlewareHandler }) =>
    /**
     * Start the broaker
     * @returns <Promise>
     */
    () => {
        return Promise.resolve()
            .then(() => middlewareHandler.callHandlersAsync('starting', [state], true))
            .then(() => {
                if (transport) {
                    return transport.connect()
                }
            })
            .then(() => Promise.all(state.services.map(service => service.start(service))))
            .catch(error => {
                log.error('Unable to start all services', error)
                clearInterval(state.waitForServiceInterval)
                return Promise.reject(error)
            })
            .then(() => {
                state.isStarted = true
                log.info(`Weave service node with ${state.services.length} services is started successfully.`)
            })
            .then(() => {
                if (state.isStarted) {
                    if (state.options.started) {
                        state.options.started.call(state)
                    }
                }
            })
    }

module.exports = startFactory
