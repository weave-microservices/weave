const { Weave } = require('@weave-js/core')

exports.command = 'connect'
exports.description = 'Connect to a existing network'
exports.builder = {
    transport: {
        alias: 't',
        default: '',
        description: 'Transport adapter'
    },
    loglevel: {
        alias: 'l',
        default: 'info',
        description: 'Log level'
    }
}

exports.handler = async ({ transport, loglevel }) => {
    if (!transport) {
        throw new Error('You have to specify a transport adapter.')
    }

    const config = {
        logger: {
            logLevel: loglevel
        }
    }

    config.transport = {
        adapter: transport
    }

    const broker = Weave(config)

    broker.start()
        .then(() => broker.repl())
}
