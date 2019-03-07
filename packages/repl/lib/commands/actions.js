
const chalk = require('chalk')
const { table } = require('table')

module.exports = (vorpal, broker) => {
    vorpal
        .command('actions', 'List actions')
        .action((args, done) => {
            const data = []
            data.push([
                chalk.bold('Action'),
                chalk.bold('Nodes'),
                chalk.bold('State'),
                chalk.bold('Cached'),
                chalk.bold('Params')
            ])

            const list = []
            const actions = broker.registry.actions.list({
                withEndpoints: true
            })
            actions.map(item => {
                const action = item.action
                const params = action && action.params ? Object.keys(action.params).join(', ') : ''

                if (action) {
                    data.push([
                        action.name,
                        item.hasLocal ? `(*)${item.count}` : item.count,
                        item.hasAvailable ? chalk.bgGreen.black('  OK  ') : chalk.bgRed.white.bold(' FAILURE '),
                        action.cache ? chalk.green('Yes') : chalk.gray('No'),
                        params
                    ])
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
