#!/usr/bin/env node
const { cleanArgs } = require('./utils/args')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const { program } = require('commander')

// Check for new CLI version
updateNotifier({ pkg }).notify()

program
  .version(`@weave-js/cli ${require('../package').version}`)
  .usage('<command> [options]')

// start command
program
  .command('start')
  .description('Start a new weave broker instance')
  .option('-c, --config [configPath]', 'Start broker with config file.')
  .option('-s, --services <servicePath>', 'Start broker with services loaded from the given path.')
  .option('-r, --repl', 'Start broker with REPL.')
  .option('-w, --watch', 'Start broker with service watcher.')
  .option('-sl, --silent', 'Start broker without console outputs.')
  .action((options) => {
    require('./commands/start').handler(cleanArgs(options))
  })

// create command
program
  .command('create <type> <name>')
  .description('create a new project powered by vue-cli-service')
  .option('-t,--template <teplate>', 'Start broker with config file.')
  .option('-s,--suffix <suffix>', 'Service file suffix (default: service)')
  .action((type, name, options) => {
    require('./commands/create').handler(type, name, options)
  })
program.parse(process.argv)
