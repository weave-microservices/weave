const Vorpal = require('vorpal');
const path = require('path');
const cliUI = require('./utils/cli-ui');

function registerCommands (vorpal, broker) {
  const commandsFolderPath = path.join(__dirname, 'commands');
  const dependencies = { vorpal, broker, cliUI };

  // Register REPL commands
  require(path.join(commandsFolderPath, 'actions'))(dependencies);
  require(path.join(commandsFolderPath, 'benchmark'))(dependencies);
  require(path.join(commandsFolderPath, 'broadcast'))(dependencies);
  require(path.join(commandsFolderPath, 'call'))(dependencies);
  require(path.join(commandsFolderPath, 'clear'))(dependencies);
  require(path.join(commandsFolderPath, 'dcall'))(dependencies);
  require(path.join(commandsFolderPath, 'emit'))(dependencies);
  require(path.join(commandsFolderPath, 'events'))(dependencies);
  require(path.join(commandsFolderPath, 'info'))(dependencies);
  require(path.join(commandsFolderPath, 'metrics'))(dependencies);
  require(path.join(commandsFolderPath, 'nodes'))(dependencies);
  require(path.join(commandsFolderPath, 'services'))(dependencies);
}

const registerCustomCommands = (vorpal, broker, commands) => commands.map(registerCustomCommand => registerCustomCommand({ vorpal, broker, cliUI }));

/**
 * @typedef {Object} CommandContext
 * @param {Vorpal} vorpal - Vorpal instance
 * @param {import('@weave-js/core').Broker} broker - Broker instance
 * @param  {Object} cliUI - CLI UI
 */

/**
 * Clean up all existing REPL commands to prevent duplication warnings
 */
function cleanupExistingCommands (vorpal) {
  const commandNames = [
    'exit', 'q', 'quit', 'close',
    'actions', 'benchmark', 'broadcast', 'call', 'clear',
    'dcall', 'emit', 'events', 'info', 'metrics', 'nodes', 'services'
  ];

  commandNames.forEach(commandName => {
    const command = vorpal.find(commandName);
    if (command) {
      command.remove();
    }
  });

  // Also clean up commands with parameters (more specific patterns)
  const parameterizedCommands = [
    'benchmark <action> [jsonParams]',
    'broadcast <eventName>',
    'call <actionName> [jsonParams]',
    'dcall <nodeId> <actionName> [jsonParams]',
    'emit <eventName>'
  ];

  parameterizedCommands.forEach(commandPattern => {
    const command = vorpal.find(commandPattern);
    if (command) {
      command.remove();
    }
  });
}

/**
 * Register weave repl
 * @param {import('@weave-js/core').Broker} broker - Broker instance
 * @param  {...function(CommandContext):void} customCommands - Custom commands
 * @returns {void}
 */
module.exports = (broker, ...customCommands) => {
  if (!broker) {
    throw new Error('You have to pass a weave broker instance.');
  }

  if (!customCommands.every(command => typeof command === 'function')) {
    throw new Error('Custom commands need to be a function.');
  }
  const vorpal = new Vorpal();

  // Clean up all existing commands to prevent duplication warnings
  cleanupExistingCommands(vorpal);

  // exit command
  vorpal
    .command('q', 'Exit application')
    .alias('quit')
    .alias('exit')
    .alias('close')
    .action(async (args) => {
      await broker.stop();
      process.exit(0);
    });

  registerCommands(vorpal, broker);
  registerCustomCommands(vorpal, broker, customCommands);

  vorpal
    .delimiter(cliUI.whiteText('weave') + cliUI.successText('$'))
    .show();
};
