const { delay } = require('../utils')
// const { WeaveRequestTimeoutError } = require('../../errors')

const wrapTimeoutMiddleware = function (handler, action) {
    const self = this
    const options = Object.assign({}, self.options.retryPolicy, action.retryPolicy || {})
    return (context) => {
        if (!context.retryCount) {
            context.retryCount = 0
        }
        const attempts = context.options.retries ? context.options.retries : options.retries
        return handler(context)
            .catch(error => {
                if (context.retryCount++ < attempts && error.retryable === true) {
                    return delay(options.delay).then(() => self.call(context.action.name, context.params, { context }))
                }
                return Promise.reject(error)
            })
    }
}

module.exports = () => {
    return {
        localAction: wrapTimeoutMiddleware,
        remoteAction: wrapTimeoutMiddleware
    }
}
