/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'errors'.
const errors = require('@weave-js/errors');
class RetrieableError extends Error {
    constructor() {
        // @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'IArguments' is not assignable to... Remove this comment to see the full error message
        super(arguments);
        this.retryable = true;
    }
}
module.exports = errors({
    WeaveError: { code: 500 },
    WeaveRetrieableError: { baseClass: RetrieableError },
    WeaveServiceNotFoundError: {},
    WeaveServiceNotAvailableError: {},
    WeaveRequestTimeoutError: {},
    WeaveParameterValidationError: {},
    WeaveBrokerOptionsError: {},
    WeaveQueueSizeExceededError: {}
});
//# sourceMappingURL=new-errors.js.map