#!/usr/bin/env node
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')

updateNotifier({ pkg }).notify()

// command packages
const create = require('./commands/create')
const start = require('./commands/start')

require('yargs')
    .usage('Usage: $0 <command> [options]')
    .version()
    .command(create)
    .command(start)
    .help()
    .argv
