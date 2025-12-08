/**
 * @typedef {import('../types.__js').TransportAdapter} TransportAdapter
 **/

import { createTransport } from "../transport/createTransport.mts";
import TransportAdapters from "../transport/adapters/index.mts";
import type { Runtime } from '../../types/index.js';

export const initTransport = (runtime: Runtime) => {
  if (runtime.options.transport?.adapter) {
    const adapter = TransportAdapters.resolve(runtime, runtime.options.transport);

    Object.defineProperty(runtime, "transport", {
      value: createTransport(runtime, adapter),
    });
  }
};
