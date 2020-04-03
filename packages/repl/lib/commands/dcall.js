const chalk = require('chalk')
const _ = require('lodash')
const utils = require('../utils')
const util = require('util')

module.exports = (vorpal, broker) => {
  vorpal
    .command('dcall <nodeId> <actionName> [jsonParams]', 'Direct call of an action using its node ID.')
    .autocomplete({
      data () {
        return _.uniq(broker.registry.actions.list({}).map(item => item.name))
      }
    })
    .allowUnknownOptions()
    .action((args, done) => {
      let payload
      if (typeof (args.jsonParams) === 'string') {
        try {
          payload = JSON.parse(args.jsonParams)
        } catch (error) {
          console.log(error.message)
          done()
        }
      } else {
        payload = utils.convertArgs(args.options)
      }

      const nodeId = args.nodeId
      console.log(chalk.yellow.bold(`>> Call '${args.actionName}' with params:`), payload)
      broker.call(args.actionName, payload, { nodeId })
        .then(res => {
          console.log(chalk.yellow.bold('>> Response:'))
          console.log(util.inspect(res, {
            showHidden: false,
            depth: 4,
            colors: true
          }))
        })
        .catch(err => {
          console.error(chalk.red.bold('>> ERROR:', err.message))
          console.error(chalk.red.bold(err.stack))
          console.error('Data: ', util.inspect(err.data, {
            showHidden: false,
            depth: 4,
            colors: true
          }))
        })
        .finally(done)
    })
}
