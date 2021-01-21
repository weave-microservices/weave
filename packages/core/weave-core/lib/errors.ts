/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
export class WeaveError extends Error {
    nodeId: string;
    code: number;
    data: any;
    retryable: Boolean;
    type: string;
    constructor(message, code = 500, type = null, data = null) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.type = type;
        this.data = data;
        this.retryable = false;
    }
}

export class WeaveRetrieableError extends WeaveError {
    code: number;
    data: any;
    retryable: Boolean;
    type: string;
    constructor(message, code, type, data) {
        super(message, code, type, data);
        this.code = code || 500;
        this.type = type;
        this.data = data;
        this.retryable = true;
    }
}

export class WeaveServiceNotFoundError extends WeaveRetrieableError {
    data: any;
    constructor(data) {
        let message;
        if (data.actionName && (data as any).nodeId) {
            message = `Service "${(data as any).actionName}" not found on node "${data.nodeId}".`;
        }
        else if ((data as any).actionName) {
            message = `Service "${(data as any).actionName}" not found.`;
        }
        super(message, 404, 'WEAVE_SERVICE_NOT_FOUND_ERROR', data);
    }
}

export class WeaveServiceNotAvailableError extends WeaveRetrieableError {
    constructor(data = {}) {
        let message;
        if ((data as any).nodeId) {
            message = `Service "${(data as any).actionName}" not available on node "${(data as any).nodeId}".`;
        }
        else {
            message = `Service "${(data as any).actionName}" not available.`;
        }
        super(message, 405, 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR', data);
    }
}

export class WeaveRequestTimeoutError extends WeaveRetrieableError {
    retryable: any;
    constructor(actionName, nodeId, timeout) {
        const message = `Action ${actionName} timed out node ${nodeId || '<local>'}.`;
        super(message, 504, 'WEAVE_REQUEST_TIMEOUT_ERROR', {
            actionName,
            nodeId
        });
        this.retryable = true;
    }
}

export class WeaveParameterValidationError extends WeaveError {
    constructor(message, data) {
        super(message, 422, 'WEAVE_PARAMETER_VALIDATION_ERROR', data);
    }
}

export class WeaveBrokerOptionsError extends WeaveError {
    constructor(message, data) {
        super(message, 500, 'WEAVE_BROKER_OPTIONS_ERROR', data);
    }
}

export class WeaveQueueSizeExceededError extends WeaveError {
    constructor(data) {
        super('Queue size limit was exceeded. Request rejected.', 429, 'WEAVE_QUEUE_SIZE_EXCEEDED_ERROR', data);
    }
}

export class WeaveMaxCallLevelError extends WeaveError {
    constructor(data) {
        super(`Request level has reached the limit (${data.maxCallLevel}) on node "${data.nodeId}".`, 500, 'WEAVE_MAX_CALL_LEVEL_ERROR', data);
    }
}

export function restoreError (error) {
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
