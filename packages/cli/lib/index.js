#!/usr/bin/env node
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')

updateNotifier({ pkg }).notify()

// command packages
const create = require('./commands/create')

require('yargs')
    .usage('Usage: $0 <command> [options]')
    .version()
    .command(create)
    .help()
    .argv
