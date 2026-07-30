/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { WeaveBrokerOptionsError } from "../../errors.mts";
import fromURI from "./fromURI.mts";
import getAdapterByName from "./getAdapterByName.mts";
import adapters from "./adapters.mts";
import type { Runtime, TransportOptions } from "../../../types/index.js";
import type { BaseTransportAdapter } from "./adapterBase.mts";

/**
 * Extended transport options with optional nested adapter options
 */
interface ExtendedTransportOptions extends TransportOptions {
  /** Additional options to pass to the adapter factory */
  options?: Record<string, unknown>;
}

const resolve = (
  runtime: Runtime,
  options: ExtendedTransportOptions,
): BaseTransportAdapter | object | null => {
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
    return options.adapter as object;
  }

  return null;
};

export default Object.assign({ resolve, fromURI }, adapters);
