import { createTransport } from "../transport/createTransport.mts";
import TransportAdapters from "../transport/adapters/index.mts";
import type { Runtime, TransportAdapter } from "../../types/index.js";

export const initTransport = (runtime: Runtime): void => {
  if (runtime.options.transport?.adapter) {
    const adapter = TransportAdapters.resolve(runtime, runtime.options.transport);

    if (adapter) {
      Object.defineProperty(runtime, "transport", {
        value: createTransport(runtime, adapter as TransportAdapter),
      });
    }
  }
};
