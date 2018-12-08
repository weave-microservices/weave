/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { promiseTimeout } = require('../utils')
const { WeaveRequestTimeoutError } = require('../errors')

const wrapTimeoutMiddleware = function (handler, action) {
    const self = this
    return function timeoutMiddleware (context) {
        if (typeof context.options.timeout === 'undefined' || context.options.timeout === null) {
            context.options.timeout = self.options.requestTimeout || 0
        }

        if (context.options.timeout > 0 && !context.startHighResolutionTime) {
            context.startHighResolutionTime = process.hrtime()
        }

        let promise = handler(context)

        if (context.options.timeout > 0) {
            promise = promiseTimeout(context.options.timeout, promise, new WeaveRequestTimeoutError(context.action.name, context.nodeId))
        }
        return promise
    }
}

module.exports = () => {
    return {
        localAction: wrapTimeoutMiddleware,
        remoteAction: wrapTimeoutMiddleware
    }
}
