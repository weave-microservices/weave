/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */
import crypto from "crypto";
import { isObject, isString } from "@weave-js/utils";
import * as Constants from "../../metrics/constants.mts";
import * as Errors from "../../errors.mts";
import { default as getCacheKeyByObject } from "../getCacheKeyByObject.mts";
import { default as getPropertyFromDataOrMetadata } from "../getPropertyFromDataOrMetadata.mts";
import type { Runtime } from "../../../types/index.js";

function generateHash(key: string) {
  return crypto.createHash("sha1").update(key).digest("base64");
}

function registerCacheMetrics(metrics: any) {
  metrics.register({ type: "counter", name: Constants.CACHE_GET_TOTAL });
  metrics.register({ type: "counter", name: Constants.CACHE_SET_TOTAL });
  metrics.register({ type: "counter", name: Constants.CACHE_FOUND_TOTAL });
  metrics.register({ type: "counter", name: Constants.CACHE_EXPIRED_TOTAL });
  metrics.register({ type: "counter", name: Constants.CACHE_DELETED_TOTAL });
  metrics.register({ type: "counter", name: Constants.CACHE_CLEANED_TOTAL });
}

export const createCacheBase = (
  name: string,
  runtime: Runtime,
  adapterOptions: any,
  options: any,
) => {
  if (!isString(name)) {
    throw new Errors.WeaveError("Name must be a string.");
  }

  const cache = {
    name,
    isConnected: false,
    runtime,
    options: Object.assign(
      {
        ttl: null,
      },
      options,
    ),
    init() {
      if (runtime.metrics) {
        this.metrics = runtime.metrics;
        registerCacheMetrics(runtime.metrics);
      }
    },
    log: runtime.createLogger("CACHER"),
    set(/* hashKey, result, ttl */) {
      /* istanbul ignore next */
      runtime.handleError(new Error("Method not implemented."));
    },
    get(/* hashKey */) {
      /* istanbul ignore next */
      runtime.handleError(new Error("Method not implemented."));
    },
    remove() {
      /* istanbul ignore next */
      runtime.handleError(new Error("Method not implemented."));
    },
    clear() {
      /* istanbul ignore next */
      runtime.handleError(new Error("Method not implemented."));
    },
    stop() {
      /* istanbul ignore next */
      return Promise.resolve();
    },
    /**
     * Generates a caching key for action data/metadata.
     * @param {string} actionName Namme of the action
     * @param {any} data  Data
     * @param {object=} metadata Metadata
     * @param {Array<string>=} keys Key array
     * @returns {string} Result key string
     */
    getCachingKey(actionName, data, metadata, keys) {
      if (data || metadata) {
        const prefix = actionName + ".";

        if (keys) {
          if (keys.length === 1) {
            const cacheKeyData = getPropertyFromDataOrMetadata.getPropertyFromDataOrMetadata(
              data,
              metadata,
              keys[0],
            );
            const key = getCacheKeyByObject.getCacheKeyByObject(cacheKeyData);
            const value = prefix + (isObject(cacheKeyData) ? key : cacheKeyData);
            return prefix + generateHash(value);
          }

          if (keys.length > 0) {
            const valueString = keys.reduce((pre, property, index) => {
              let value = getPropertyFromDataOrMetadata.getPropertyFromDataOrMetadata(
                data,
                metadata,
                property,
              );
              value = getCacheKeyByObject.getCacheKeyByObject(value);

              return pre + (index > 0 ? "|" : "") + value;
            }, prefix);

            return prefix + generateHash(valueString);
          }
        } else {
          const value = getCacheKeyByObject.getCacheKeyByObject(data);
          return prefix + generateHash(value);
        }
      }

      return actionName;
    },
  };

  Object.defineProperty(cache, "adapterOptions", {
    value: adapterOptions,
    writable: false,
  });

  return cache;
};
