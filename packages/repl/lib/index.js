const vorpal = require('vorpal')()
const path = require('path')
const fs = require('fs')

function registerCommands (vorpal, broker) {
  const commandsFolderPath = path.join(__dirname, 'commands')
  fs.readdirSync(commandsFolderPath).forEach(file => {
    require(path.join(commandsFolderPath, file))(vorpal, broker)
  })
}

module.exports = broker => {

  if (!broker) {
    throw new Error('You have to pass a weave broker instance.')
  }

  vorpal.find('exit').remove()

  // exit command
  vorpal
    .command('q', 'Exit application')
    .alias('quit')
    .alias('exit')
    .action((args, done) => {
      broker.stop()
        .then(() => process.exit(0))
      done()
    })

  registerCommands(vorpal, broker)
  vorpal
    .delimiter('weave $')
    .show()
}
