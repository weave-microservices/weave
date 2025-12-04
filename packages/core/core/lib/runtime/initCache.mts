import { isFunction } from "@weave-js/utils";
import { WeaveError } from "../errors.mts";
import type { Runtime } from "../../types/index.js";

export const initCache = (runtime: Runtime) => {
  if (runtime.options.cache && runtime.options.cache.enabled) {
    if (!isFunction(runtime.options.cache.adapter)) {
      throw new WeaveError("Invalid cache adapter.");
    }

    const cache = runtime.options.cache.adapter(runtime, runtime.options.cache);

    runtime.log.info(`Cache: ${cache.name}`);

    Object.defineProperty(runtime, "cache", {
      value: cache,
    });
  }
};
