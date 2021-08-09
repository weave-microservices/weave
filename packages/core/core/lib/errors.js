/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

class WeaveError extends Error {
  constructor (message, code, type, data) {
    super(message)
    this.name = this.constructor.name
    this.code = code || 500
    this.type = type
    this.data = data
    this.retryable = false
  }
}

class WeaveRetrieableError extends WeaveError {
  constructor (message, code, type, data) {
    super(message)
    this.code = code || 500
    this.type = type
    this.data = data
    this.retryable = true
  }
}

class WeaveServiceNotFoundError extends WeaveRetrieableError {
  constructor (data = {}) {
    let message

    if (data.actionName && data.nodeId) {
      message = `Service "${data.actionName}" not found on node "${data.nodeId}".`
    } else if (data.actionName) {
      message = `Service "${data.actionName}" not found.`
    }

    super(message, 404, 'WEAVE_SERVICE_NOT_FOUND_ERROR', data)
  }
}

class WeaveServiceNotAvailableError extends WeaveRetrieableError {
  constructor (data = {}) {
    let message
    if (data.nodeId) {
      message = `Service "${data.actionName}" not available on node "${data.nodeId}".`
    } else {
      message = `Service "${data.actionName}" not available.`
    }

    super(message, 405, 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR', data)
  }
}

class WeaveRequestTimeoutError extends WeaveRetrieableError {
  constructor (actionName, nodeId, timeout) {
    const message = `Action ${actionName} timed out node ${nodeId || '<local>'}.`
    super(message, 504, 'WEAVE_REQUEST_TIMEOUT_ERROR', {
      actionName,
      nodeId
    })
    this.retryable = true
  }
}

class WeaveParameterValidationError extends WeaveError {
  constructor (message, data) {
    super(message, 422, 'WEAVE_PARAMETER_VALIDATION_ERROR', data)
  }
}

class WeaveBrokerOptionsError extends WeaveError {
  constructor (message, data) {
    super(message, 500, 'WEAVE_BROKER_OPTIONS_ERROR', data)
  }
}

class WeaveQueueSizeExceededError extends WeaveError {
  constructor (data) {
    super('Queue size limit was exceeded. Request rejected.', 429, 'WEAVE_QUEUE_SIZE_EXCEEDED_ERROR', data)
  }
}

class WeaveMaxCallLevelError extends WeaveError {
  constructor (data) {
    super(`Request level has reached the limit (${data.maxCallLevel}) on node "${data.nodeId}".`, 500, 'WEAVE_MAX_CALL_LEVEL_ERROR', data)
  }
}

class WeaveGracefulStopTimeoutError extends WeaveError {
  constructor (service) {
    super(`Unable to stop service "${service.name}"`, 500, 'GRACEFUL_STOP_TIMEOUT', {
      name: service.name,
      version: service.version
    })
  }
}

const restoreError = error => {
  const ErrorClass = module.exports[error.name]

  if (ErrorClass) {
    switch (error.name) {
    case 'WeaveError':
      return new ErrorClass(error.message, error.code, error.type, error.data)
            // case 'WeaveParameterValidationError':
            //     return new ErrorClass(error.message, error.data)
    }
  }
}

module.exports = {
  WeaveBrokerOptionsError,
  WeaveMaxCallLevelError,
  WeaveError,
  WeaveParameterValidationError,
  WeaveQueueSizeExceededError,
  WeaveRequestTimeoutError,
  WeaveRetrieableError,
  WeaveServiceNotAvailableError,
  WeaveServiceNotFoundError,
  WeaveGracefulStopTimeoutError,
  restoreError
}
