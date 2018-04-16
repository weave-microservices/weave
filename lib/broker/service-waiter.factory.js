/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const serviceWaiterFactory = ({ state, log, registry }) =>
    (serviceNames, timeout, interval) => {
        return new Promise((resolve, reject) => {
            const check = () => {
                const count = serviceNames.filter(serviceName => registry.hasService(serviceName))

                if (count.length === serviceNames.length) {
                    return resolve()
                }
                log.info(`Waiting for service...`)
                state.waitForServiceInterval = setTimeout(check, interval || 500)
            }
            check()
        })
    }

module.exports = serviceWaiterFactory
