/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'isString'.
const { isString, isFunction } = require('@weave-js/utils');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'WeaveBroke... Remove this comment to see the full error message
const { WeaveBrokerOptionsError } = require('../errors');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'adapters'.
const adapters = {
    Memory: require('./memory')
};
exports.adapters = adapters;
exports.createCacheBase = require('./base').createCacheBase;
exports.resolve = (cacheOptions) => {
    const getByName = name => {
        if (!name) {
            return null;
        }
        const n = Object.keys(adapters).find(n => n.toLowerCase() === name.toLowerCase());
        if (n) {
            return adapters[n];
        }
    };
    let cacheFactory;
    if (cacheOptions === true) {
        cacheFactory = (this as any).adapters.Memory;
    }
    else if (isString(cacheOptions)) {
        const cache = getByName(cacheOptions);
        if (cache) {
            cacheFactory = cache;
        }
        else {
            // @ts-expect-error ts-migrate(2554) FIXME: Expected 2 arguments, but got 1.
            throw new WeaveBrokerOptionsError(`Unknown cache type "${cacheOptions}"`);
        }
    }
    else if (isFunction(cacheOptions)) {
        cacheFactory = cacheOptions;
    }
    if (cacheFactory) {
        return cacheFactory;
    }
};
