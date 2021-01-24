"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@weave-js/utils");
const errors_1 = require("../../errors");
const adapters = {
    Event: require('./event')
};
const getByName = name => {
    if (!name) {
        return null;
    }
    const n = Object.keys(adapters).find(n => n.toLowerCase() === name.toLowerCase());
    if (n) {
        return adapters[n];
    }
};
exports.default = {
    resolve(broker, options) {
        let cacheFactory;
        if (options === true) {
            cacheFactory = this.adapters.Event;
        }
        else if (utils_1.isString(options)) {
            const cache = getByName(options);
            if (cache) {
                cacheFactory = cache;
            }
            else {
                throw new errors_1.WeaveBrokerOptionsError(`Unknown metric adapter: "${options}"`);
            }
        }
        else if (utils_1.isFunction(options)) {
            cacheFactory = options;
        }
        if (cacheFactory) {
            return cacheFactory;
        }
    }
};
