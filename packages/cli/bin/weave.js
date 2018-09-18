#!/usr/bin/env node
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')

updateNotifier({ pkg }).notify()
require('yargs')
	.usage('Usage: $0 <command> [options]')
	.version()
	.command(require('../src/create'))
	.help()
	.argv