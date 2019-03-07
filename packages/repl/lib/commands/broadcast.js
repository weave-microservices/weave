const chalk = require('chalk')
const _ = require('lodash')
const { convertArgs } = require('../utils')

module.exports = (vorpal, broker) => {
    vorpal
        .command('broadcast <eventName>', 'Broadcast a event.')
        .autocomplete({
            data () {
                return _.uniq(broker.registry.events.list({}).map(item => item.name))
            }
        })
        .allowUnknownOptions()
        .action((args, done) => {
            const payload = convertArgs(args.options)
            console.log(chalk.yellow.bold(`>> Broadcast '${args.eventName}' with payload:`), payload)
            broker.broadcast(args.eventName, payload)
            done()
        })
}
