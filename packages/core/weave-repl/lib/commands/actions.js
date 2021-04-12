
const { table } = require('table')
const cliUI = require('../utils/cli-ui')

module.exports = (vorpal, broker) => {
  vorpal
    .command('actions', 'List actions')
    .action((args, done) => {
      const data = []
      data.push([
        ('Action'),
        cliUI.tableHeaderText('Nodes'),
        cliUI.tableHeaderText('State'),
        cliUI.tableHeaderText('Cached'),
        cliUI.tableHeaderText('Params')
      ])

      const list = []

      const actions = broker.runtime.registry.actionCollection.list({
        withEndpoints: true
      })

      actions.map(item => {
        const action = item.action
        const params = action && action.params ? Object.keys(action.params).join(', ') : ''

        if (action) {
          data.push([
            action.name,
            item.hasLocal ? `(*)${item.count}` : item.count,
            item.hasAvailable ? cliUI.successLabel('  OK  ') : cliUI.failureLabel(' FAILURE '),
            action.cache ? cliUI.successText('Yes') : cliUI.neutralText('No'),
            params
          ])
        }
      })

      list.map(service => {
        data.push([
          service.name,
          service.version ? service.version : 1,
          service.isAvailable ? cliUI.successLabel('  OK  ') : cliUI.failureLabel(' FAILURE '),
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
