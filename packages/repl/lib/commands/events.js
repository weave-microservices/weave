
const chalk = require('chalk')
const { table } = require('table')

module.exports = (vorpal, broker) => {
    vorpal
        .command('events', 'List registered events.')
        .action((args, done) => {
            const data = []
            data.push([
                chalk.bold('Event'),
                chalk.bold('Group'),
                chalk.bold('State'),
                chalk.bold('Nodes')
            ])

            const events = broker.registry.events.list({
                withEndpoints: true
            })
            events.map(event => {
                if (event) {
                    data.push([
                        event.name,
                        event.groupName,
                        event.hasAvailable ? chalk.bgGreen.black('  OK  ') : chalk.bgRed.white.bold(' FAILURE '),
                        event.count
                    ])
                }
            })

            // list.map(service => {
            //     data.push([
            //         service.name,
            //         service.version ? service.version : 1,
            //         service.isAvailable ? chalk.bgGreen.black('  OK  ') : chalk.bgRed.white.bold(' FAILURE '),
            //         service.actions,
            //         service.events,
            //         service.nodes.length
            //     ])
            // })

            const tableConf = {}

            console.log(table(data, tableConf))
            done()
        })
}
