/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const serviceWaiterFactory = ({ state, log, registry }) =>
    (serviceNames, timeout, interval) => {
        return new Promise((resolve, reject) => {
            const check = () => {
                if (!Array.isArray(serviceNames)) {
                    serviceNames = [serviceNames]
                }
                const count = serviceNames.filter(serviceName => registry.hasService(serviceName))

                if (count.length === serviceNames.length) {
                    log.info('All expected services available.')
                    return resolve()
                }

                log.info(`Waiting for services...`)
                state.waitForServiceInterval = setTimeout(check, interval || 500)
            }
            check()
        })
    }

module.exports = serviceWaiterFactory
