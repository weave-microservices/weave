const vorpal = require('vorpal')()
const path = require('path')
const fs = require('fs')
const cliUI = require('./utils/cli-ui')

function registerCommands (vorpal, broker) {
  const commandsFolderPath = path.join(__dirname, 'commands')
  fs.readdirSync(commandsFolderPath).forEach(file => {
    require(path.join(commandsFolderPath, file))({ vorpal, broker, cliUI })
  })
}

const registerCustomCommands = (vorpal, broker, commands) => commands.map(registerCustomCommand => registerCustomCommand({ vorpal, broker, cliUI }))

/**
 * @typedef {Object} CommandContext
 * @param {Vorpal} vorpal - Vorpal instance
 * @param {Broker} broker - Broker instance
 * @param  {Object} cliUI - CLI UI
 */

/**
 * Register weave repl
 * @param {Broker} broker - Broker instance
 * @param  {...function(CommandContext):void} customCommands - Custom commands
 * @returns {void}
 */
module.exports = (broker, ...customCommands) => {
  if (!broker) {
    throw new Error('You have to pass a weave broker instance.')
  }

  if (!customCommands.every(command => typeof command === 'function')) {
    throw new Error('Custom commands need to be a function.')
  }

  // if (!Array.isArray(customCommands)) {
  //   throw new Error('Custom commands need to be')
  // }

  vorpal.find('exit').remove()

  // exit command
  vorpal
    .command('q', 'Exit application')
    .alias('quit')
    .alias('exit')
    .action((args, done) => {
      broker
        .stop()
        .then(() => process.exit(0))
      done()
    })

  registerCommands(vorpal, broker)
  registerCustomCommands(vorpal, broker, customCommands)

  vorpal
    .delimiter(cliUI.whiteText('weave') + cliUI.successText('$'))
    .show()
}
