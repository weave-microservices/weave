import * as errors from "../errors.mts";

/**
 * Serialized error payload from network transport
 */
export interface ErrorPayload {
  name: keyof typeof errors | string;
  message?: string;
  data?: {
    actionName?: string;
    nodeId?: string;
    timeout?: number;
    service?: string | { name: string; version?: string | number };
    [key: string]: unknown;
  };
  stack?: string;
  code?: string;
  nodeId?: string;
}

/**
 * Extended Error interface with additional properties
 */
interface ExtendedError extends Error {
  nodeId?: string;
  code?: string;
  data?: unknown;
}

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
 * @param {ErrorPayload} errorPayload Serialized error payload from network transport
 * @returns {Error} Restored error instance with proper type and properties
 */
export const restoreError = (errorPayload: ErrorPayload): Error => {
  const ErrorClass = errors[errorPayload.name as keyof typeof errors] as
    | (new (...args: unknown[]) => Error)
    | undefined;
  let error: ExtendedError | undefined;

  if (ErrorClass) {
    switch (errorPayload.name) {
      case "WeaveError":
      case "WeaveRetryableError": {
        const { message, ...options } = errorPayload;
        error = new ErrorClass(message, options);
        break;
      }

      case "WeaveParameterValidationError":
      case "WeaveBrokerOptionsError": {
        const { message, data } = errorPayload;
        error = new ErrorClass(message, data);
        break;
      }
      case "WeaveServiceNotFoundError":
      case "WeaveServiceNotAvailableError":
      case "WeaveQueueSizeExceededError":
      case "WeaveMaxCallLevelError": {
        const { data } = errorPayload;
        error = new ErrorClass(data);
        break;
      }
      case "WeaveRequestTimeoutError": {
        const { data } = errorPayload;
        error = new ErrorClass(data?.actionName, data?.nodeId, data?.timeout);
        break;
      }
      case "WeaveGracefulStopTimeoutError": {
        const { data } = errorPayload;
        error = new ErrorClass(data?.service);
        break;
      }
    }
  }

  if (!error) {
    error = new Error(errorPayload.message) as ExtendedError;

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
