/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const connectFactory = ({ transport, log }) =>
    () => {
        log.info('Connecting to transport adapter...')
        const doConnect = (isTryReconnect) => {
            transport.connect(isTryReconnect).catch((error) => {
                log.warn('Connection failed')
                log.debug('Error ' + error.message)

                setTimeout(() => {
                    log.info('Reconnecting')
                    doConnect(true)
                }, 5 * 1000)
            })
        }
        doConnect(false)
    }

module.exports = connectFactory
