/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const connectFactory = ({ adapter, log }) =>
    () => {
        log.info('Connecting to transport adapter...')
        const doConnect = (isTryReconnect) => {
            return adapter.connect(isTryReconnect)
                .catch((error) => {
                    log.warn('Connection failed')
                    log.debug('Error ' + error.message)
                    if (!error.skipRetry) {
                        setTimeout(() => {
                            log.info('Reconnecting')
                            doConnect(true)
                        }, 5 * 1000)
                    }
                })
        }
        return doConnect(false)
    }

module.exports = connectFactory
