/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const makeLocalRequestProxy = ({ call, log, registry, Errors }) =>
    context => {
        const actionName = context.action.name
        const endpointList = registry.getActionEndpoints(actionName)

        if (endpointList == null || !endpointList.hasLocal()) {
            log.warn(`Service ${actionName} not found localy.`)
            return Promise.reject('Service not found')
        }

        const endpoint = endpointList.getNextLocalEndpoint()
        if (!endpoint) {
            log.warn(`Service ${actionName} is not available localy.`)
            return Promise.reject('Service not found')
        }
        // const options = {}

        return endpoint.action.handler(context)
    }

module.exports = makeLocalRequestProxy
