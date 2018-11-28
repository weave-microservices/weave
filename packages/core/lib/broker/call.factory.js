/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const makeCallUtils = ({ state, log, registry }) => {
    let contextFactory = null

    function setContextFactory (cf) {
        contextFactory = cf
    }

    function call (actionName, params, opts = {}) {
        const endpoint = registry.getNextAvailableActionEndpoint(actionName, opts)

        if (endpoint instanceof Error) {
            return Promise.reject(endpoint)
        }

        const action = endpoint.action
        const nodeId = endpoint.node.id
        let context

        if (opts.context !== undefined) {
            context = opts.context
            context.nodeId = nodeId
        } else {
            context = contextFactory.create(action, nodeId, params, opts, endpoint)
        }

        if (endpoint.isLocal) {
            log.debug(`Call action local.`, { action: actionName, requestId: context.requestId })
        } else {
            log.debug(`Call action on remote node.`, { action: actionName, nodeId, requestId: context.requestId })
        }

        const p = action.handler(context)
        p.context = context

        return p
    }

    return {
        setContextFactory,
        call
    }
}

module.exports = makeCallUtils
