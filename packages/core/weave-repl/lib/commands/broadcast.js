const convertArgs = require('../utils/convert-args')
const cliUI = require('../utils/cli-ui')

module.exports = (vorpal, broker) => {
  vorpal
    .command('broadcast <eventName>', 'Broadcast a event.')
    .autocomplete({
      data () {
        return [...new Set(broker.registry.eventCollection.list({}).map(item => item.name))]
      }
    })
    .allowUnknownOptions()
    .action((args, done) => {
      const payload = convertArgs(args.options)

      console.log(cliUI.infoText(`>> Broadcast '${args.eventName}' with payload:`), payload)

      broker.broadcast(args.eventName, payload)
      done()
    })
}
