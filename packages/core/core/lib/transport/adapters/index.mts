/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { WeaveBrokerOptionsError } from "../../errors.mts";
import fromURI from "./fromURI.mts";
import getAdapterByName from "./getAdapterByName.mts";
import adapters from "./adapters.mts";
import type { Runtime, TransportOptions } from '../../../types/index.js';

const resolve = (runtime: Runtime, options: TransportOptions) => {
  if (typeof options === "object") {
    if (typeof options.adapter === "string") {
      const Adapter = getAdapterByName(options.adapter);

      if (Adapter) {
        return Adapter(options.options);
      } else {
        runtime.handleError(
          new WeaveBrokerOptionsError(`Invalid transport settings: ${options.adapter}`),
        );
      }
    }
    return options.adapter;
  }

  return null;
};

export default Object.assign({ resolve, fromURI }, adapters);
