/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'WeaveError... Remove this comment to see the full error message
const { WeaveError } = require('../errors');
const wrapErrorHandlerMiddleware = function (handler) {
    const broker = this;
    return function errorHandlerMiddlware(context) {
        return handler(context)
            .catch(error => {
            if (!(error instanceof Error)) {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 4 arguments, but got 2.
                error = new WeaveError(error, 500);
            }
            if (broker.nodeId !== context.nodeId) {
                broker.transport.removePendingRequestsById(context.id);
            }
            broker.log.debug(`The action ${context.action.name} is rejected`, { requestId: context.id }, error);
            return broker.handleError(error);
        });
    };
};
module.exports = () => {
    return {
        localAction: wrapErrorHandlerMiddleware,
        remoteAction: wrapErrorHandlerMiddleware
    };
};
