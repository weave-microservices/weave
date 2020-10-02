const { Weave } = require('@weave-js/core')
const repl = require('@weave-js/repl')
const { getConfig } = require('../../utils/config')
const { loadServices } = require('./services')

exports.handler = async (args) => {
  try {
    // get config
    const config = getConfig(args)

    // enable file watcher
    if (args.watch) {
      config.watchServices = true
    }

    // enable silent option. Disable log output
    if (args.silent) {
      config.logger = config.logger ? Object.assign(config.logger, { enabled: false }) : { enabled: false }
    }

    // init broker
    const broker = Weave(config)

    // load services
    if (args.services) {
      loadServices(broker, args.services)
    }

    // start broker
    await broker.start()

    // start REPL
    if (args.repl) {
      repl(broker)
    }
  } catch (error) {
    console.error(error)
  }
}
