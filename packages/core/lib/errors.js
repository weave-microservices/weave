/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const ExtendableError = require('es6-error')

class WeaveError extends ExtendableError {
    constructor (message, code, type, data) {
        super(message)
        this.code = code || 500
        this.type = type
        this.data = data
        this.retryable = false
    }
}

class WeaveRetrieableError extends ExtendableError {
    constructor (message, code, type, data) {
        super(message)
        this.code = code || 500
        this.type = type
        this.data = data
        this.retryable = true
    }
}

class WeaveServiceNotFoundError extends WeaveRetrieableError {
    constructor (actionName, nodeId) {
        const message = `Service ${actionName} not found on node ${nodeId || '<local>'}`
        super(message, 404, null, {
            actionName,
            nodeId
        })
    }
}

class WeaveServiceNotAvailableError extends WeaveRetrieableError {
    constructor (actionName, nodeId) {
        const message = `Service ${actionName} not available on node ${nodeId || '<local>'}`
        super(message, 405, null, {
            actionName,
            nodeId
        })
    }
}

class WeaveRequestTimeoutError extends WeaveRetrieableError {
    constructor (actionName, nodeId, timeout) {
        const message = `Action ${actionName} timed out node ${nodeId || '<local>'}`
        super(message, 504, null, {
            actionName,
            nodeId
        })
        this.retryable = true
    }
}

class WeaveParameterValidationError extends WeaveError {
    constructor (message, type, data) {
        super(message, 422, type, data)
    }
}

class WeaveBrokerOptionsError extends WeaveError {
    constructor (message, data) {
        super(message, 500, 'WEAVE_BROKER_OPTIONS_ERROR', data)
    }
}

class WeaveQueueSizeExceededError extends WeaveError {
    constructor (data) {
        super(`Queue size limit was exceeded. Request rejected.`, 429, 'QUEUE_SIZE_EXXCEEDED', data)
    }
}

module.exports = {
    WeaveBrokerOptionsError,
    WeaveError,
    WeaveParameterValidationError,
    WeaveQueueSizeExceededError,
    WeaveRequestTimeoutError,
    WeaveRetrieableError,
    WeaveServiceNotAvailableError,
    WeaveServiceNotFoundError
}
