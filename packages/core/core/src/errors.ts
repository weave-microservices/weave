/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { ExtendableError } from './ExtendableError';
import { Service } from './service/Service';

class WeaveError extends ExtendableError {
  public code: number;
  public type?: string; 
  public data: unknown;
  public retryable: boolean;

  constructor (message: string, code?: number, type?: string, data?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.code = code || 500;
    this.type = type  || 'WEAVE_UNKNOWN_ERROR';
    this.data = data;
    this.retryable = false;
  }
}

class WeaveRetryableError extends WeaveError {
  constructor (message: string, code: number, type: string, data: unknown) {
    super(message);
    this.code = code || 500;
    this.type = type;
    this.data = data;
    this.retryable = true;
  }
}

class WeaveServiceNotFoundError extends WeaveRetryableError {
  constructor (data: any = {}) {
    let message;

    if (data.actionName && data.nodeId) {
      message = `Service "${data.actionName}" not found on node "${data.nodeId}".`;
    } else if (data.actionName) {
      message = `Service "${data.actionName}" not found.`;
    } else {
      message = 'Service not found.';
    }

    super(message, 404, 'WEAVE_SERVICE_NOT_FOUND_ERROR', data);
  }
}

class WeaveServiceNotAvailableError extends WeaveRetryableError {
  constructor (data:any = {}) {
    let message;
    if (data.nodeId) {
      message = `Service "${data.actionName}" not available on node "${data.nodeId}".`;
    } else if (data.actionName) {
      message = `Service "${data.actionName}" not available.`;
    } else {
      message = 'Service not available.';
    }

    super(message, 503, 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR', data);
  }
}

class WeaveRequestTimeoutError extends WeaveRetryableError {
  constructor (actionName: string, nodeId: string, timeout: number) {
    const message = `Action ${actionName} timed out node ${nodeId || '<local>'}.`;
    super(message, 504, 'WEAVE_REQUEST_TIMEOUT_ERROR', {
      actionName,
      nodeId,
      timeout
    });
  }
}

class WeaveParameterValidationError extends WeaveError {
  constructor (message: string, data: any) {
    super(message, 422, 'WEAVE_PARAMETER_VALIDATION_ERROR', data);
  }
}

class WeaveBrokerOptionsError extends WeaveError {
  constructor (message: string, data: any) {
    super(message, 500, 'WEAVE_BROKER_OPTIONS_ERROR', data);
  }
}

class WeaveQueueSizeExceededError extends WeaveError {
  constructor (data: any) {
    super('Queue size limit was exceeded. Request rejected.', 429, 'WEAVE_QUEUE_SIZE_EXCEEDED_ERROR', data);
  }
}

class WeaveMaxCallLevelError extends WeaveError {
  constructor (data: any) {
    super(`Request level has reached the limit (${data.maxCallLevel}) on node "${data.nodeId}".`, 500, 'WEAVE_MAX_CALL_LEVEL_ERROR', data);
  }
}

class WeaveGracefulStopTimeoutError extends WeaveError {
  constructor (service: Service) {
    super(`Unable to stop service "${service.name}"`, 500, 'GRACEFUL_STOP_TIMEOUT', {
      name: service.name,
      version: service.version
    });
  }
}

const restoreError = (error: any) => {
  const ErrorClass = module.exports[error.name];

  if (ErrorClass) {
    switch (error.name) {
    case 'WeaveError':
      return new ErrorClass(error.message, error.code, error.type, error.data);
            // case 'WeaveParameterValidationError':
            //     return new ErrorClass(error.message, error.data)
    }
  }
};

export {
  WeaveBrokerOptionsError,
  WeaveMaxCallLevelError,
  WeaveError,
  WeaveParameterValidationError,
  WeaveQueueSizeExceededError,
  WeaveRequestTimeoutError,
  WeaveRetryableError,
  WeaveServiceNotAvailableError,
  WeaveServiceNotFoundError,
  WeaveGracefulStopTimeoutError,
  restoreError
};
