// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isString'.
const { isString, isFunction } = require('@weave-js/utils');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'WeaveBroke... Remove this comment to see the full error message
const { WeaveBrokerOptionsError } = require('../../errors');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'adapters'.
const adapters = {
    Event: require('./event')
};
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getByName'... Remove this comment to see the full error message
const getByName = name => {
    if (!name) {
        return null;
    }
    const n = Object.keys(adapters).find(n => n.toLowerCase() === name.toLowerCase());
    if (n) {
        return adapters[n];
    }
};
module.exports = {
    resolve(broker, options) {
        let cacheFactory;
        if (options === true) {
            cacheFactory = this.adapters.Event;
        }
        else if (isString(options)) {
            const cache = getByName(options);
            if (cache) {
                cacheFactory = cache;
            }
            else {
                // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
                throw new WeaveBrokerOptionsError(`Unknown metric adapter: "${options}"`);
            }
        }
        else if (isFunction(options)) {
            cacheFactory = options;
        }
        if (cacheFactory) {
            return cacheFactory;
        }
    }
};
