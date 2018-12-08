/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const connectFactory = ({ adapter, log, transport }) =>
    () => {
        return new Promise(resolve => {
            transport.resolveConnect = resolve
            log.info('Connecting to transport adapter...')
            const doConnect = (isTryReconnect) => {
                const errorHandler = error => {
                    log.warn('Connection failed')
                    log.debug('Error ' + error.message)
                    if (!error.skipRetry) {
                        setTimeout(() => {
                            log.info('Reconnecting')
                            doConnect(true)
                        }, 5 * 1000)
                    }
                }
                return adapter.connect(isTryReconnect, errorHandler)
                    .catch(errorHandler)
            }
            doConnect(false)
        })
    }

module.exports = connectFactory
