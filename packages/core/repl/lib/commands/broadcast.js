const convertArgs = require('../utils/convert-args');

module.exports = ({ vorpal, broker, cliUI }) => {
  vorpal
    .command('broadcast <eventName>', 'Broadcast a event.')
    .autocomplete({
      data () {
        return [...new Set(broker.runtime.registry.eventCollection.list({}).map(item => item.name))];
      }
    })
    .allowUnknownOptions()
    .action((args, done) => {
      const payload = convertArgs(args.options);

      console.log(cliUI.infoText(`>> Broadcast '${args.eventName}' with payload:`), payload);

      broker.broadcast(args.eventName, payload);
      done();
    });
};
