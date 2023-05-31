/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { defaultsDeep } = require('@weave-js/utils');
const { ExtendableError } = require('./ExtendableError');

/**
 * @typedef {object} ErrorOptions
 * @property {string} code Error code
 * @property {boolean} retryable Retryable error
 * @property {*} data Error data
 * @property {string} name Error name
*/

class WeaveError extends ExtendableError {
  /**
   * Create a new WeaveRetryableError
   * @param {string} message Error message
   * @param {ErrorOptions} options? Error options
  */
  constructor (message, options = {}) {
    options = defaultsDeep(
      options,
      {
        code: 'WEAVE_ERROR',
        retryable: false
      }
    );

    super(message, options);
    this.name = this.constructor.name;
    this.code = options.code || 'WEAVE_ERROR';
    this.data = options.data;
    this.retryable = false;
  }
}

class WeaveRetryableError extends WeaveError {
  /**
   * Create a new WeaveRetryableError
   * @param {string} message Error message
   * @param {ErrorOptions} options Error options
  */
  constructor (message, options = { code: 'WEAVE_RETRYABLE_ERROR', retryable: true }) {
    super(message, options);
    this.retryable = true;
  }
}

class WeaveServiceNotFoundError extends WeaveRetryableError {
  constructor (data = {}) {
    let message;

    if (data.actionName && data.nodeId) {
      message = `Service "${data.actionName}" not found on node "${data.nodeId}".`;
    } else if (data.actionName) {
      message = `Service "${data.actionName}" not found.`;
    } else {
      message = 'Service not found.';
    }

    super(message, { code: 'WEAVE_SERVICE_NOT_FOUND_ERROR', data });
  }
}

class WeaveServiceNotAvailableError extends WeaveRetryableError { // 503
  constructor (data = {}) {
    let message;
    if (data.nodeId) {
      message = `Service "${data.actionName}" not available on node "${data.nodeId}".`;
    } else if (data.actionName) {
      message = `Service "${data.actionName}" not available.`;
    } else {
      message = 'Service not available.';
    }

    super(message, { code: 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR', data });
  }
}

class WeaveRequestTimeoutError extends WeaveRetryableError { // 504
  constructor (actionName, nodeId, timeout) {
    const data = {
      actionName,
      nodeId,
      timeout
    };

    const message = `Action ${actionName} timed out node ${nodeId || '<local>'}.`;
    super(message, { code: 'WEAVE_REQUEST_TIMEOUT_ERROR', data });
  }
}

class WeaveParameterValidationError extends WeaveError { // 422
  constructor (message, data) {
    super(message, { code: 'WEAVE_PARAMETER_VALIDATION_ERROR', data });
  }
}

class WeaveBrokerOptionsError extends WeaveError {
  constructor (message, data) {
    super(
      message,
      { code: 'WEAVE_BROKER_OPTIONS_ERROR', data }
    );
  }
}

class WeaveQueueSizeExceededError extends WeaveError { // 429
  constructor (data) {
    super(
      'Queue size limit was exceeded. Request rejected.',
      { code: 'WEAVE_QUEUE_SIZE_EXCEEDED_ERROR', data }
    );
  }
}

class WeaveMaxCallLevelError extends WeaveError {
  constructor (data) {
    super(
      `Request level has reached the limit ${data.maxCallLevel} on node "${data.nodeId}".`,
      { code: 'WEAVE_MAX_CALL_LEVEL_ERROR', data }
    );
  }
}

class WeaveGracefulStopTimeoutError extends WeaveError {
  constructor (service) {
    const data = {
      name: service.name,
      version: service.version
    };

    super(
      `Unable to stop service "${service.name}"`,
      { code: 'WEAVE_GRACEFUL_STOP_TIMEOUT', data }
    );
  }
}

module.exports = {
  WeaveBrokerOptionsError,
  WeaveMaxCallLevelError,
  WeaveError,
  WeaveParameterValidationError,
  WeaveQueueSizeExceededError,
  WeaveRequestTimeoutError,
  WeaveRetryableError,
  WeaveServiceNotAvailableError,
  WeaveServiceNotFoundError,
  WeaveGracefulStopTimeoutError
};
