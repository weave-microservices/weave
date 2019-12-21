const { Weave } = require('@weave-js/core')
const repl = require('@weave-js/repl')

exports.command = 'start'
exports.description = 'Start a new Weave broker'
exports.builder = {
    url: {
        alias: 'u',
        default: '',
        description: 'URL of a new endpoint'
    }
}

exports.handler = async ({ url }) => {
    const config = {
        logger: {
            logLevel: 'info'
        }
    }
    const broker = Weave(config)

    broker.start()
        .then(() => repl(broker))
}
