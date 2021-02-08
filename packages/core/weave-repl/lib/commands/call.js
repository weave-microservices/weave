const invokeAction = require('../helper/invoke-action')

module.exports = (vorpal, broker) => {
  vorpal
    .command('call <actionName> [jsonParams]', 'Call an action.')
    .alias('c')
    .option('--l [filename]', 'Load params from file')
    .option('--stream [filename]', 'Send a file as stream')
    .option('--s [filename]', 'Save response to file')
    .autocomplete({
      data () {
        return [...new Set(broker.registry.actionCollection.list({}).map(item => item.name))]
      }
    })
    .allowUnknownOptions()
    .action(invokeAction(broker))
}
