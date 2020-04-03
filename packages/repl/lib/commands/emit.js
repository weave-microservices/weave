const chalk = require('chalk')
const _ = require('lodash')
const { convertArgs } = require('../utils')

module.exports = (vorpal, broker) => {
  vorpal
    .command('emit <eventName>', 'Emit a event.')
    .autocomplete({
      data () {
        return _.uniq(broker.registry.events.list({}).map(item => item.name))
      }
    })
    .allowUnknownOptions()
    .action((args, done) => {
      const payload = convertArgs(args.options)
      console.log(chalk.yellow.bold(`>> Emit '${args.eventName}' with payload:`), payload)
      broker.emit(args.eventName, payload)
      done()
    })
}
