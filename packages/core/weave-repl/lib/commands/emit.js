const cliUI = require('../utils/cli-ui')
const convertArgs = require('../utils/convert-args')

module.exports = (vorpal, broker) => {
  vorpal
    .command('emit <eventName>', 'Emit a event.')
    .autocomplete({
      data () {
        return [...new Set(broker.runtime.registry.eventCollection.list({}).map(item => item.name))]
      }
    })
    .allowUnknownOptions()
    .action((args, done) => {
      const payload = convertArgs(args.options)
      console.log(cliUI.infoText(`>> Emit '${args.eventName}' with payload:`), payload)
      broker.emit(args.eventName, payload)
      done()
    })
}
