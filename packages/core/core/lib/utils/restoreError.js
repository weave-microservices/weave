const errors = require('../errors');

/**
 * Restore a Weave error from a serialized error payload
 *
 * Reconstructs proper error instances from serialized error data received
 * over the network. Handles all Weave-specific error types with their
 * specific constructor signatures and fallback to generic Error for
 * unknown error types.
 *
 * Supported error types:
 * - WeaveError, WeaveRetryableError: Standard errors with message and options
 * - WeaveParameterValidationError, WeaveBrokerOptionsError: Validation errors
 * - WeaveServiceNotFoundError, WeaveServiceNotAvailableError: Service errors
 * - WeaveQueueSizeExceededError, WeaveMaxCallLevelError: Resource errors
 * - WeaveRequestTimeoutError: Timeout-specific errors with action/node context
 * - WeaveGracefulStopTimeoutError: Shutdown timeout errors
 *
 * @param {Object} errorPayload Serialized error payload from network transport
 * @param {string} errorPayload.name Error class name
 * @param {string} errorPayload.message Error message
 * @param {Object} [errorPayload.data] Error-specific data
 * @param {string} [errorPayload.stack] Original stack trace
 * @param {string} [errorPayload.code] Error code
 * @param {string} [errorPayload.nodeId] Node ID where error occurred
 * @returns {Error} Restored error instance with proper type and properties
 */
const restoreError = (errorPayload) => {
  const ErrorClass = errors[errorPayload.name];
  let error;

  if (ErrorClass) {
    switch (errorPayload.name) {
    case 'WeaveError':
    case 'WeaveRetryableError': {
      const { message, ...options } = errorPayload;
      error = new ErrorClass(message, options);
      break;
    }

    case 'WeaveParameterValidationError':
    case 'WeaveBrokerOptionsError': {
      const { message, data } = errorPayload;
      error = new ErrorClass(message, data);
      break;
    }
    case 'WeaveServiceNotFoundError':
    case 'WeaveServiceNotAvailableError':
    case 'WeaveQueueSizeExceededError':
    case 'WeaveMaxCallLevelError': {
      const { data } = errorPayload;
      error = new ErrorClass(data);
      break;
    }
    case 'WeaveRequestTimeoutError': {
      const { data } = errorPayload;
      error = new ErrorClass(data.actionName, data.nodeId, data.timeout);
      break;
    }
    case 'WeaveGracefulStopTimeoutError': {
      const { data } = errorPayload;
      error = new ErrorClass(data.service);
      break;
    }
    }
  } else {
    error = new Error(errorPayload.message);

    error.name = errorPayload.name;

    error.nodeId = errorPayload.nodeId;

    if (errorPayload.code) {
      error.code = errorPayload.code;
    }

    if (errorPayload.data) {
      error.data = errorPayload.data;
    }
  }

  if (errorPayload.stack) {
    error.stack = errorPayload.stack;
  }

  return error;
};

module.exports = { restoreError };
