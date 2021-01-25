export declare class WeaveError extends Error {
    nodeId: string;
    code: number;
    data: any;
    retryable: Boolean;
    type: string;
    constructor(message: any, code?: number, type?: any, data?: any);
}
export declare class WeaveRetrieableError extends WeaveError {
    code: number;
    data: any;
    retryable: Boolean;
    type: string;
    constructor(message: any, code: any, type: any, data: any);
}
export declare class WeaveServiceNotFoundError extends WeaveRetrieableError {
    data: any;
    constructor(data: any);
}
export declare class WeaveServiceNotAvailableError extends WeaveRetrieableError {
    constructor(data?: {});
}
export declare class WeaveRequestTimeoutError extends WeaveRetrieableError {
    retryable: any;
    constructor(actionName: any, nodeId: any, timeout: any);
}
export declare class WeaveParameterValidationError extends WeaveError {
    constructor(message: any, data: any);
}
export declare class WeaveBrokerOptionsError extends WeaveError {
    constructor(message: any, data?: any);
}
export declare class WeaveQueueSizeExceededError extends WeaveError {
    constructor(data: any);
}
export declare class WeaveMaxCallLevelError extends WeaveError {
    constructor(data: any);
}
export declare function restoreError(error: any): any;
