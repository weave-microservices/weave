"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolve = exports.createCacheBase = exports.adapters = void 0;
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
const utils_1 = require("@weave-js/utils");
const errors_1 = require("../errors");
const memory_1 = __importDefault(require("./memory"));
const adapters = {
    Memory: memory_1.default
};
exports.adapters = adapters;
var base_1 = require("./base");
Object.defineProperty(exports, "createCacheBase", { enumerable: true, get: function () { return base_1.createCacheBase; } });
function resolve(cacheOptions) {
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
        cacheFactory = this.adapters.Memory;
    }
    else if (utils_1.isString(cacheOptions)) {
        const cache = getByName(cacheOptions);
        if (cache) {
            cacheFactory = cache;
        }
        else {
            throw new errors_1.WeaveBrokerOptionsError(`Unknown cache type "${cacheOptions}"`);
        }
    }
    else if (utils_1.isFunction(cacheOptions)) {
        cacheFactory = cacheOptions;
    }
    if (cacheFactory) {
        return cacheFactory;
    }
}
exports.resolve = resolve;
;
