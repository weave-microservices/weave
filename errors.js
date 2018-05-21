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

class WeaveServiceNotFoundError extends WeaveError {
    constructor (actionName, nodeId) {
        const message = `Service ${actionName} not found on node ${nodeId || '<local>'}`
        super(message, 404, null, {
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
// todo: validation error
module.exports = {
    WeaveError,
    WeaveRetrieableError,
    WeaveServiceNotFoundError,
    WeaveRequestTimeoutError,
    WeaveParameterValidationError
}
