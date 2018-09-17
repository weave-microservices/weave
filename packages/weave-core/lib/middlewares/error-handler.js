const { WeaveError } = require('../errors')

const wrapErrorHandlerMiddleware = function (handler) {
    const self = this
    return function errorHandlerMiddlware (context) {
        return handler(context)
            .catch(error => {
                if (!(error instanceof Error)) {
                    error = new WeaveError(error, 500)
                }
                if (self.nodeId !== context.nodeId) {
                    self.transport.removePendingRequestsById(context.id)
                }

                self.log.debug(`The action ${context.action.name} is rejected`, { requestId: context.id }, error)
                return Promise.reject(error)
            })
    }
}
module.exports = () => {
    return {
        localAction: wrapErrorHandlerMiddleware,
        remoteAction: wrapErrorHandlerMiddleware
    }
}
