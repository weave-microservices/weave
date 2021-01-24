/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
import { isString, isFunction } from '@weave-js/utils'
import { WeaveBrokerOptionsError } from '../errors'
import Memory from './memory'

const adapters = {
    Memory
}

export { adapters }

export { createCacheBase } from './base';

export function resolve (cacheOptions) {
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
    } else if (isString(cacheOptions)) {
        const cache = getByName(cacheOptions);
        if (cache) {
            cacheFactory = cache;
        }
        else {
            throw new WeaveBrokerOptionsError(`Unknown cache type "${cacheOptions}"`);
        }
    } else if (isFunction(cacheOptions)) {
        cacheFactory = cacheOptions;
    }

    if (cacheFactory) {
        return cacheFactory;
    }
};
