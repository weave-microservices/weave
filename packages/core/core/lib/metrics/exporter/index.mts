import { isString, isFunction } from "@weave-js/utils";
import { WeaveBrokerOptionsError } from "../../errors.mts";

type AdapterModule = typeof import("./base.mts") | typeof import("./event.mts");

const adapters: Record<string, AdapterModule> = {
  Base: await import("./base.mts"),
  Event: await import("./event.mts"),
};

const getByName = (name: string): AdapterModule | undefined => {
  if (!name) {
    return undefined;
  }

  const n = Object.keys(adapters).find((n) => n.toLowerCase() === name.toLowerCase());

  if (n) {
    return adapters[n];
  }
};

type ResolveOptions = boolean | string | AdapterModule | (() => AdapterModule);

export default {
  ...adapters,
  resolve(options: ResolveOptions): AdapterModule | (() => AdapterModule) | undefined {
    let cacheFactory;

    if (options === true) {
      cacheFactory = adapters.Event;
    } else if (isString(options)) {
      const cache = getByName(options);

      if (cache) {
        cacheFactory = cache;
      } else {
        throw new WeaveBrokerOptionsError(`Unknown metric adapter: "${options}"`);
      }
    } else if (isFunction(options)) {
      cacheFactory = options;
    }

    if (cacheFactory) {
      return cacheFactory;
    }
  },
};
