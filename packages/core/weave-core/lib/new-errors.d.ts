declare const errors: any;
declare class RetrieableError extends Error {
    retryable: any;
    constructor();
}
