
const cliUI = require('../utils/cli-ui')
const { table } = require('table')

module.exports = (vorpal, broker) => {
  vorpal
    .command('events', 'List registered events.')
    .action((args, done) => {
      const data = []
      data.push([
        cliUI.tableHeaderText('Event'),
        cliUI.tableHeaderText('Group'),
        cliUI.tableHeaderText('State'),
        cliUI.tableHeaderText('Nodes')
      ])

      const events = broker.registry.eventCollection.list({
        withEndpoints: true
      })

      events.map(event => {
        if (event) {
          data.push([
            event.name,
            event.groupName,
            event.hasAvailable ? cliUI.successLabel('  OK  ') : cliUI.failureLabel(' FAILURE '),
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
