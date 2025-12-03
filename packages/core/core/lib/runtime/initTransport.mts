/**
 * @typedef {import('../types.__js').TransportAdapter} TransportAdapter
**/

import { createTransport } from '../transport/createTransport.mts';
import TransportAdapters from '../transport/adapters/index.mts';

export const initTransport = (runtime) => {
  if (runtime.options.transport.adapter) {
    /** @type {TransportAdapter} */
    const adapter = TransportAdapters.resolve(runtime, runtime.options.transport);

    Object.defineProperty(runtime, 'transport', {
      value: createTransport(runtime, adapter)
    });
  }
};
