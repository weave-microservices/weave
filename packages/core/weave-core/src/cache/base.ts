/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
import crypto from 'crypto'
import { isObject } from '@weave-js/utils'
import { Broker } from '../shared/interfaces/broker.interface';
import { Middleware } from '../shared/interfaces/middleware.interface';
import { Cache } from '../shared/interfaces/cache.interface';

function getCacheKeyByObject(val) {
    if (Array.isArray(val)) {
        return val.map(object => getCacheKeyByObject(object)).join('/');
    }
    else if (isObject(val)) {
        return Object.keys(val).map(key => {
            return [key, getCacheKeyByObject(val[key])].join('/');
        }).join('/');
    }
    else if (val !== null) {
        return val.toString();
    }
    else {
        return 'null';
    }
}
function generateHash(key) {
    return (crypto as any).createHash('sha1')
        .update(key)
        .digest('base64');
}
function registerCacheMetrics(metrics) {
    // todo: register metric stores
}

export function createCacheBase(broker: Broker, options): Cache {
    const cache: Cache = {
        options: Object.assign({
            ttl: null
        }, options),
        init() {
            this.broker = broker;
            this.metrics = broker.metrics;
            if (this.broker) {
                registerCacheMetrics(this.metrics);
            }
        },
        log: broker.createLogger('CACHER'),
        set(hashKey: string, result: any, ttl: number) {
            /* istanbul ignore next */
            broker.handleError(new Error('Method not implemented.'));
            return Promise.resolve()
        },
        get(hashKey: string) {
            /* istanbul ignore next */
            broker.handleError(new Error('Method not implemented.'));
            return Promise.resolve()
        },
        remove(hashKey: string) {
            /* istanbul ignore next */
            broker.handleError(new Error('Method not implemented.'));
            return Promise.resolve()
        },
        clear(patter: string) {
            /* istanbul ignore next */
            broker.handleError(new Error('Method not implemented.'));
            return Promise.resolve()
        },
        stop() {
            /* istanbul ignore next */
            return Promise.resolve();
        },
        getCachingHash(actionName: string, params: any, meta: any, keys: Array<string>) {
            if (params || meta) {
                const prefix = `${actionName}:`;
                if (keys) {
                    if (keys.length === 1) {
                        const value = params[keys[0]];
                        const key = getCacheKeyByObject(value);
                        return prefix + (isObject(value) ? key : value);
                    }
                    if (keys.length > 0) {
                        const res = keys.reduce((pre, property, i) => {
                            const value = params[property];
                            let hash;
                            if (isObject(value)) {
                                const key = getCacheKeyByObject(value);
                                hash = generateHash(key);
                            }
                            else {
                                hash = value;
                            }
                            return pre + (i > 0 ? '|' : '') + hash;
                        }, prefix);
                        return res;
                    }
                }
                else {
                    return prefix + generateHash(getCacheKeyByObject(params));
                }
            }
            return actionName;
        },
        createMiddleware(): Middleware {
            return {
                localAction (handler, action) {
                    const cacheOptions = Object.assign({ enabled: true }, isObject(action.cache) ? action.cache : { enabled: !!action.cache });
                    if (cacheOptions.enabled) {
                        return function cacheMiddleware(context) {
                            const cacheHashKey = cache.getCachingHash(action.name, context.data, context.meta, action.cache.keys);
                            context.isCachedResult = false;
                            return (cache.get(cacheHashKey) as any).then((content) => {
                                if (content !== null) {
                                    context.isCachedResult = true;
                                    return content;
                                }
                                return handler(context).then((result) => {
                                    cache.set(cacheHashKey, result, action.cache.ttl);
                                    return result;
                                });
                            });
                        };
                    }
                    return handler;
                }
            }
        }
    };

    return cache;
};
