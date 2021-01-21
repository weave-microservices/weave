// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'WeaveMaxCa... Remove this comment to see the full error message
const { WeaveMaxCallLevelError } = require('../../errors');
exports.createCall = (context, broker) => ({
    /**
     * Call a action.
     * @param {string} actionName Name of the action.
     * @param {object} params Parameter
     * @param {object} [options={}] Call options
     * @returns {Promise} Promise
    */
    call(actionName, params, options = {}) {
        (options as any).parentContext = this;
        if ((options as any).maxCallLevel < this.level) {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 1 arguments, but got 2.
            return Promise.reject(new WeaveMaxCallLevelError(broker.nodeId, context.level));
        }
        const p = broker.call(actionName, params, options);
        return p.then(result => {
            if (p.context) {
                context.meta = Object.assign(context.meta, p.context.meta);
            }
            return result;
        });
    }
});
