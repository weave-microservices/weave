const { delay } = require('../utils')
// const { WeaveRequestTimeoutError } = require('../../errors')

const wrapRetryMiddleware = function (handler, action) {
    const self = this
    const options = Object.assign({}, self.options.retryPolicy, action.retryPolicy || {})
    if (options.enabled) {
        return function retryMiddleware (context) {
            if (context.retryCount === undefined) {
                context.retryCount = 0
            }
            let attempts = options.retries
            if (context.options.retries !== undefined) {
                attempts = context.options.retries
            }
            return handler(context).catch(error => {
                if (context.retryCount++ < attempts && error.retryable === true) {
                    return delay(options.delay).then(() => self.call(context.action.name, context.params, { context }))
                }
                return Promise.reject(error)
            })
        }
    }
    return handler
}

module.exports = () => {
    return {
        localAction: wrapRetryMiddleware,
        remoteAction: wrapRetryMiddleware
    }
}
