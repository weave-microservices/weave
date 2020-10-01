#!/usr/bin/env node
const { cleanArgs } = require('./utils/args')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')
const { program } = require('commander')

updateNotifier({ pkg }).notify()

program
  .version(`@weave-js/cli ${require('../package').version}`)
  .usage('<command> [options]')

program
  .command('create <project-name>')
  .action((name, args) => {
    require('./commands/create')(name, args)
  })

program
  .command('start')
  .description('create a new project powered by vue-cli-service')
  .option('-c, --config [configPath]', 'Start broker with config file.')
  .option('-s, --services <servicePath>', 'Start broker with services loaded from the given path.')
  .option('-r, --repl', 'Start broker with REPL.')
  .option('-w, --watch', 'Start broker with service watcher.')
  .option('-sl, --silent', 'Start broker without console outputs.')
  .action((command) => {
    require('./commands/start/command').handler(cleanArgs(command))
  })

program.parse(process.argv)
