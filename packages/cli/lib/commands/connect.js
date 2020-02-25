const { Weave, TransportAdapters } = require('@weave-js/core')
const repl = require('@weave-js/repl')

exports.command = 'connect'
exports.description = 'Connect to a existing weave structure.'
exports.builder = {
  transport: {
    alias: 't',
    default: '',
    description: 'Transport connection string'
  },
  loglevel: {
    alias: 'l',
    default: 'info',
    description: 'Log level'
  }
}

exports.handler = async ({ transport, loglevel }) => {
  if (!transport) {
    throw new Error('You have to specify a connection string.')
  }

  const broker = Weave({
    logger: {
      logLevel: loglevel
    },
    transport: {
      adapter: TransportAdapters.fromURI(transport)
    }
  })

  broker.start()
    .then(() => repl(broker))
}
