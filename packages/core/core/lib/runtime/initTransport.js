/**
 * @typedef {import('../types').TransportAdapter} TransportAdapter
**/

const { createTransport } = require('../transport/createTransport')
const TransportAdapters = require('../transport/adapters')

exports.initTransport = (runtime) => {
  if (runtime.options.transport.adapter) {
    /** @type {TransportAdapter} */
    const adapter = TransportAdapters.resolve(runtime, runtime.options.transport)

    Object.defineProperty(runtime, 'transport', {
      value: createTransport(runtime, adapter)
    })
  }
}
