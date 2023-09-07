/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const { defaultsDeep } = require('@weave-js/utils');
import { ExtendableError } from './ExtendableError'


export type ErrorOptions = {
  code?: string,
  data?: unknown
}

export type RetryableErrorOptions = ErrorOptions & {
  retryable?: boolean
}


export class WeaveError extends ExtendableError {
  public code: string;
  public data: unknown;

  constructor (message: string, options: ErrorOptions = {}) {
    options = defaultsDeep(
      options,
      {
        code: 'WEAVE_ERROR',
        retryable: false
      }
    );

    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'WEAVE_ERROR';
    this.data = options.data;
  }
}

export class WeaveRetryableError extends WeaveError {
  public readonly retryable: boolean;

  constructor(message: string, options: RetryableErrorOptions = { code: 'WEAVE_RETRYABLE_ERROR', retryable: true }) {
    super(message, options);
    this.retryable = true;
  }
}

export class WeaveServiceNotFoundError extends WeaveRetryableError {
  constructor (data: any = {}) {
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

export class WeaveServiceNotAvailableError extends WeaveRetryableError {
  constructor (data: any = {}) {
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

export class WeaveRequestTimeoutError extends WeaveRetryableError {
  constructor (actionName: string, nodeId: string, timeout: number) {
    const data = {
      actionName,
      nodeId,
      timeout
    };

    const message = `Action ${actionName} timed out node ${nodeId || '<local>'}.`;
    super(message, { code: 'WEAVE_REQUEST_TIMEOUT_ERROR', data });
  }
}

export class WeaveParameterValidationError extends WeaveError {
  constructor (message: string, data: unknown) {
    super(message, { code: 'WEAVE_PARAMETER_VALIDATION_ERROR', data });
  }
}

export class WeaveBrokerOptionsError extends WeaveError {
  constructor (message: string, data: unknown) {
    super(
      message,
      { code: 'WEAVE_BROKER_OPTIONS_ERROR', data }
    );
  }
}

export class WeaveQueueSizeExceededError extends WeaveError {
  constructor (data: unknown) {
    super(
      'Queue size limit was exceeded. Request rejected.',
      { code: 'WEAVE_QUEUE_SIZE_EXCEEDED_ERROR', data }
    );
  }
}

export class WeaveMaxCallLevelError extends WeaveError {
  constructor(nodeId: string, maxCallLevel: number) {
    super(
      `Request level has reached the limit ${maxCallLevel} on node "${nodeId}".`,
      { code: 'WEAVE_MAX_CALL_LEVEL_ERROR' }
    );
  }
}

export class WeaveGracefulStopTimeoutError extends WeaveError {
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

// module.exports = {
//   WeaveBrokerOptionsError,
//   WeaveMaxCallLevelError,
//   WeaveError,
//   WeaveParameterValidationError,
//   WeaveQueueSizeExceededError,
//   WeaveRequestTimeoutError,
//   WeaveRetryableError,
//   WeaveServiceNotAvailableError,
//   WeaveServiceNotFoundError,
//   WeaveGracefulStopTimeoutError
// };
