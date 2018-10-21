const chalk = require('chalk')
const _ = require('lodash')
const { convertArgs } = require('../utils')

module.exports = (vorpal, broker) => {
    const { registry, broadcast } = broker

    vorpal
        .command('broadcast <eventName>', 'Broadcast a event.')
        .autocomplete({
            data () {
                return _.uniq(registry.getEventList({}).map(item => item.name))
            }
        })
        .allowUnknownOptions()
        .action((args, done) => {
            const payload = convertArgs(args.options)
            console.log(chalk.yellow.bold(`>> Broadcast '${args.eventName}' with payload:`), payload)
            broadcast(args.eventName, payload)
            done()
        })
}
