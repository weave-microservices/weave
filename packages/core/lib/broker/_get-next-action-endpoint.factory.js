/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const getNextActionEndpointFactory = ({ registry }) =>
    (action, opts = {}) => {
        const endpointList = registry.getActionEndpoints(action, opts.nodeId)
        if (endpointList) {
            return endpointList.getNextAvailable()
        }
        return null
    }

module.exports = getNextActionEndpointFactory
