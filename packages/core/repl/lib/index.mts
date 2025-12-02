import Vorpal from 'vorpal';
import * as cliUI from './utils/cli-ui.mts';
import actionsCommand from './commands/actions.mts';
import benchmarkCommand from './commands/benchmark.mts';
import broadcastCommand from './commands/broadcast.mts';
import callCommand from './commands/call.mts';
import clearCommand from './commands/clear.mts';
import dcallCommand from './commands/dcall.mts';
import emitCommand from './commands/emit.mts';
import eventsCommand from './commands/events.mts';
import infoCommand from './commands/info.mts';
import metricsCommand from './commands/metrics.mts';
import nodesCommand from './commands/nodes.mts';
import servicesCommand from './commands/services.mts';

function registerCommands (vorpal: any, broker: any) {
  const dependencies = { vorpal, broker, cliUI };

  // Register REPL commands
  actionsCommand(dependencies);
  benchmarkCommand(dependencies);
  broadcastCommand(dependencies);
  callCommand(dependencies);
  clearCommand(dependencies);
  dcallCommand(dependencies);
  emitCommand(dependencies);
  eventsCommand(dependencies);
  infoCommand(dependencies);
  metricsCommand(dependencies);
  nodesCommand(dependencies);
  servicesCommand(dependencies);
}

const registerCustomCommands = (vorpal: any, broker: any, commands: any[]) => commands.map(registerCustomCommand => registerCustomCommand({ vorpal, broker, cliUI }));

export interface CommandContext {
  vorpal: any;
  broker: any;
  cliUI: typeof cliUI;
}

/**
 * Clean up all existing REPL commands to prevent duplication warnings
 */
function cleanupExistingCommands (vorpal: any): void {
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
 */
export default (broker: any, ...customCommands: ((ctx: CommandContext) => void)[]) => {
  if (!broker) {
    throw new Error('You have to pass a weave broker instance.');
  }

  if (!customCommands.every((command: any) => typeof command === 'function')) {
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
    .action(async (args: any) => {
      await broker.stop();
      process.exit(0);
    });

  registerCommands(vorpal, broker);
  registerCustomCommands(vorpal, broker, customCommands);

  vorpal
    .delimiter(cliUI.whiteText('weave') + cliUI.successText('$'))
    .show();
};
