const errors = require('../errors');

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
