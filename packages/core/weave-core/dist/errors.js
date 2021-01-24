"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreError = exports.WeaveMaxCallLevelError = exports.WeaveQueueSizeExceededError = exports.WeaveBrokerOptionsError = exports.WeaveParameterValidationError = exports.WeaveRequestTimeoutError = exports.WeaveServiceNotAvailableError = exports.WeaveServiceNotFoundError = exports.WeaveRetrieableError = exports.WeaveError = void 0;
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
class WeaveError extends Error {
    constructor(message, code = 500, type = null, data = null) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.type = type;
        this.data = data;
        this.retryable = false;
    }
}
exports.WeaveError = WeaveError;
class WeaveRetrieableError extends WeaveError {
    constructor(message, code, type, data) {
        super(message, code, type, data);
        this.code = code || 500;
        this.type = type;
        this.data = data;
        this.retryable = true;
    }
}
exports.WeaveRetrieableError = WeaveRetrieableError;
class WeaveServiceNotFoundError extends WeaveRetrieableError {
    constructor(data) {
        let message;
        if (data.actionName && data.nodeId) {
            message = `Service "${data.actionName}" not found on node "${data.nodeId}".`;
        }
        else if (data.actionName) {
            message = `Service "${data.actionName}" not found.`;
        }
        super(message, 404, 'WEAVE_SERVICE_NOT_FOUND_ERROR', data);
    }
}
exports.WeaveServiceNotFoundError = WeaveServiceNotFoundError;
class WeaveServiceNotAvailableError extends WeaveRetrieableError {
    constructor(data = {}) {
        let message;
        if (data.nodeId) {
            message = `Service "${data.actionName}" not available on node "${data.nodeId}".`;
        }
        else {
            message = `Service "${data.actionName}" not available.`;
        }
        super(message, 405, 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR', data);
    }
}
exports.WeaveServiceNotAvailableError = WeaveServiceNotAvailableError;
class WeaveRequestTimeoutError extends WeaveRetrieableError {
    constructor(actionName, nodeId, timeout) {
        const message = `Action ${actionName} timed out node ${nodeId || '<local>'} after ${timeout} milliseconds.`;
        super(message, 504, 'WEAVE_REQUEST_TIMEOUT_ERROR', {
            actionName,
            nodeId
        });
        this.retryable = true;
    }
}
exports.WeaveRequestTimeoutError = WeaveRequestTimeoutError;
class WeaveParameterValidationError extends WeaveError {
    constructor(message, data) {
        super(message, 422, 'WEAVE_PARAMETER_VALIDATION_ERROR', data);
    }
}
exports.WeaveParameterValidationError = WeaveParameterValidationError;
class WeaveBrokerOptionsError extends WeaveError {
    constructor(message, data) {
        super(message, 500, 'WEAVE_BROKER_OPTIONS_ERROR', data);
    }
}
exports.WeaveBrokerOptionsError = WeaveBrokerOptionsError;
class WeaveQueueSizeExceededError extends WeaveError {
    constructor(data) {
        super('Queue size limit was exceeded. Request rejected.', 429, 'WEAVE_QUEUE_SIZE_EXCEEDED_ERROR', data);
    }
}
exports.WeaveQueueSizeExceededError = WeaveQueueSizeExceededError;
class WeaveMaxCallLevelError extends WeaveError {
    constructor(data) {
        super(`Request level has reached the limit (${data.maxCallLevel}) on node "${data.nodeId}".`, 500, 'WEAVE_MAX_CALL_LEVEL_ERROR', data);
    }
}
exports.WeaveMaxCallLevelError = WeaveMaxCallLevelError;
function restoreError(error) {
    const ErrorClass = global[error.name];
    if (ErrorClass) {
        switch (error.name) {
            case 'WeaveError':
                return new ErrorClass(error.message, error.code, error.type, error.data);
            // case 'WeaveParameterValidationError':
            //     return new ErrorClass(error.message, error.data)
        }
    }
}
exports.restoreError = restoreError;
;
