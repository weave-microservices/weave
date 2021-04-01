const { createTransport } = require('./transport-factory')
const TransportAdapters = require('../transport/adapters')

exports.initTransport = (runtime) => {
  if (runtime.options.transport.adapter) {
    const adapter = TransportAdapters.resolve(runtime, runtime.options.transport)
    Object.defineProperty(runtime, 'transport', {
      value: createTransport(runtime, adapter)
    })
  }
}
