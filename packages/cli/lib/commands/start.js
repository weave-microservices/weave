const { Weave } = require('@weave-js/core')

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
    broker.start().then(() => broker.repl())
}
