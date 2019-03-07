
const chalk = require('chalk')
const { table } = require('table')

module.exports = (vorpal, broker) => {
    vorpal
        .command('services', 'List services')
        .action((args, done) => {
            const data = []
            data.push([
                chalk.bold('Service'),
                chalk.bold('Version'),
                chalk.bold('State'),
                chalk.bold('Actions'),
                chalk.bold('Events'),
                chalk.bold('Nodes')
            ])

            const list = []
            const services = broker.registry.services.list({
                withActions: true,
                withEvents: true
            })

            services.map(service => {
                let item = list.find(i => {
                    return i.name === service.name
                })
                if (item) {
                    item.nodes.push({
                        nodeId: service.nodeId,
                        isAvailable: service.isAvailable
                    })
                } else {
                    item = Object.create(null)
                    item.name = service.name
                    // item.version = service.version ? service.version : 1
                    item.isAvailable = service.isAvailable
                    item.actions = service.actions ? Object.keys(service.actions).length : 0
                    item.events = service.events ? Object.keys(service.events).length : 0
                    item.nodes = [{
                        nodeId: service.nodeId,
                        isAvailable: service.isAvailable
                    }]
                    list.push(item)
                }
            })

            list.map(service => {
                data.push([
                    service.name,
                    service.version ? service.version : 1,
                    service.isAvailable ? chalk.bgGreen.black('  OK  ') : chalk.bgRed.white.bold(' FAILURE '),
                    service.actions,
                    service.events,
                    service.nodes.length
                ])
            })

            const tableConf = {}

            console.log(table(data, tableConf))
            done()
        })
}
