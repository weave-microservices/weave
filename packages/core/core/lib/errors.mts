/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { defaultsDeep } from "@weave-js/utils";
import { ExtendableError } from "./ExtendableError.mts";

/**
 * Options for WeaveError and its subclasses
 */
export interface WeaveErrorOptions {
  /** Error code */
  code?: string;
  /** Whether the error is retryable */
  retryable?: boolean;
  /** Additional error data */
  data?: unknown;
}

/**
 * Data for service-related errors
 */
export interface ServiceErrorData {
  actionName?: string;
  nodeId?: string;
}

/**
 * Data for timeout errors
 */
export interface TimeoutErrorData {
  actionName: string;
  nodeId?: string;
  timeout: number;
}

/**
 * Data for max call level errors
 */
export interface MaxCallLevelErrorData {
  maxCallLevel: number;
  nodeId: string;
}

/**
 * Service info for graceful stop errors
 */
export interface ServiceInfo {
  name: string;
  version?: string | number;
}

export class WeaveError extends ExtendableError {
  code: string;
  data?: unknown;
  retryable: boolean;

  /**
   * Create a new WeaveError
   * @param message Error message
   * @param options Error options
   */
  constructor(message: string, options: WeaveErrorOptions = {}) {
    options = defaultsDeep(options, {
      code: "WEAVE_ERROR",
      retryable: false,
    });

    super(message);
    this.name = this.constructor.name;
    this.code = options.code || "WEAVE_ERROR";
    this.data = options.data;
    this.retryable = options.retryable || false;
  }
}

export class WeaveRetryableError extends WeaveError {
  /**
   * Create a new WeaveRetryableError
   * @param message Error message
   * @param options Error options
   */
  constructor(message: string, options: WeaveErrorOptions = { code: "WEAVE_RETRYABLE_ERROR", retryable: true }) {
    super(message, options);
    this.retryable = true;
  }
}

export class WeaveServiceNotFoundError extends WeaveRetryableError {
  constructor(data: ServiceErrorData = {}) {
    let message: string;

    if (data.actionName && data.nodeId) {
      message = `Service "${data.actionName}" not found on node "${data.nodeId}".`;
    } else if (data.actionName) {
      message = `Service "${data.actionName}" not found.`;
    } else {
      message = "Service not found.";
    }

    super(message, { code: "WEAVE_SERVICE_NOT_FOUND_ERROR", data });
  }
}

export class WeaveServiceNotAvailableError extends WeaveRetryableError {
  // 503
  constructor(data: ServiceErrorData = {}) {
    let message: string;
    if (data.nodeId) {
      message = `Service "${data.actionName}" not available on node "${data.nodeId}".`;
    } else if (data.actionName) {
      message = `Service "${data.actionName}" not available.`;
    } else {
      message = "Service not available.";
    }

    super(message, { code: "WEAVE_SERVICE_NOT_AVAILABLE_ERROR", data });
  }
}

export class WeaveRequestTimeoutError extends WeaveRetryableError {
  // 504
  constructor(actionName: string, nodeId: string | undefined, timeout: number) {
    const data: TimeoutErrorData = {
      actionName,
      nodeId,
      timeout,
    };

    const message = `Action ${actionName} timed out node ${nodeId || "<local>"}.`;
    super(message, { code: "WEAVE_REQUEST_TIMEOUT_ERROR", data });
  }
}

export class WeaveParameterValidationError extends WeaveError {
  // 422
  constructor(message: string, data?: unknown) {
    super(message, { code: "WEAVE_PARAMETER_VALIDATION_ERROR", data });
  }
}

export class WeaveBrokerOptionsError extends WeaveError {
  constructor(message: string, data?: unknown) {
    super(message, { code: "WEAVE_BROKER_OPTIONS_ERROR", data });
  }
}

export class WeaveQueueSizeExceededError extends WeaveError {
  // 429
  constructor(data?: unknown) {
    super("Queue size limit was exceeded. Request rejected.", {
      code: "WEAVE_QUEUE_SIZE_EXCEEDED_ERROR",
      data,
    });
  }
}

export class WeaveMaxCallLevelError extends WeaveError {
  constructor(data: MaxCallLevelErrorData) {
    super(`Request level has reached the limit ${data.maxCallLevel} on node "${data.nodeId}".`, {
      code: "WEAVE_MAX_CALL_LEVEL_ERROR",
      data,
    });
  }
}

export class WeaveGracefulStopTimeoutError extends WeaveError {
  constructor(service: ServiceInfo) {
    const data = {
      name: service.name,
      version: service.version,
    };

    super(`Unable to stop service "${service.name}"`, {
      code: "WEAVE_GRACEFUL_STOP_TIMEOUT",
      data,
    });
  }
}
