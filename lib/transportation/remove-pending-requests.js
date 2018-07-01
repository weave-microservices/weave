/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
const { WeaveError } = require('../../errors.js')
module.exports = ({ log, pendingRequests }) => {
    return {
        removePendingRequestsById (requestId) {
            pendingRequests.delete(requestId)
        },
        removePendingRequestsByNodeId (nodeId) {
            log.debug('Remove pending requests.')
            pendingRequests.forEach((request, requestId) => {
                if (request.nodeId === nodeId) {
                    pendingRequests.delete(requestId)
                }
                request.reject(new WeaveError(`Remove pending requests for node ${nodeId}.`))
            })
        }
    }
}
