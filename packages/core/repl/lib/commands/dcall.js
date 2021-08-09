const invokeAction = require('../helper/invoke-action')

module.exports = ({ vorpal, broker }) => {
  vorpal
    .command('dcall <nodeId> <actionName> [jsonParams]', 'Direct call of an action using its node ID.')
    .option('--l [filename]', 'Load params from file')
    .option('--f [filename]', 'Send a file as stream')
    .option('--s [filename]', 'Save response to file')
    .autocomplete({
      data () {
        return [...new Set(broker.runtime.registry.actionCollection.list({}).map(item => item.name))]
      }
    })
    .allowUnknownOptions()
    .action(invokeAction(broker))
}
