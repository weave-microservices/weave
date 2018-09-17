/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const serviceWaiterFactory = ({ state, log, registry }) =>
    (serviceNames, timeout, interval) => {
        if (typeof serviceNames === 'string') {
            serviceNames = [serviceNames]
        }
        return new Promise((resolve, reject) => {
            log.info(`Waiting for services '${serviceNames.join(',')}'`)
            const serviceCheck = () => {
                if (!Array.isArray(serviceNames)) {
                    serviceNames = [serviceNames]
                }
                const count = serviceNames.filter(serviceName => registry.hasService(serviceName))

                log.debug(`${count.length} services of ${serviceNames.length} available. Waiting...`)

                if (count.length === serviceNames.length) {
                    return resolve()
                }

                state.waitForServiceInterval = setTimeout(serviceCheck, interval || 500)
            }
            serviceCheck()
        })
    }

module.exports = serviceWaiterFactory
