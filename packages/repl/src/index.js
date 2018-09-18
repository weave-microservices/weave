const vorpal = require('vorpal')()
const { table, getBorderCharacters } = require('table')
const v8 = require('v8')
const chalk = require('chalk')
const _ = require('lodash')
const util = require('util')
const ora = require('ora')
const { formatNumber } = require('./utils')
const humanize = require('tiny-human-time').short

function convertArgs(args) {
	let res = {};
	_.forIn(args, (value, key) => {
		if (Array.isArray(value))
			res[key] = value;
		else if (typeof(value) == 'object')
			res[key] = convertArgs(value);
		else if (value === 'true')
			res[key] = true;
		else if (value === 'false')
			res[key] = false;
		else
			res[key] = value;
	});
	return res;
}

function createSpinner(text) {
	return ora({
		text,
		spinner: 'dots'
	});
}

module.exports = ({
	state,
	call,
	start,
	stop,
	registry,
	statistics
}) => {
    vorpal.find('exit').remove()

	// list nodes
	vorpal
		.command('nodes', 'List connected nodes')
		.action((args, done) => {
			const data =[]
			data.push([
				chalk.bold('Node ID'),
				chalk.bold('Services'),
				chalk.bold('Version'),
				chalk.bold('Client'),
				chalk.bold('IP'),
				chalk.bold('State'),
				chalk.bold('CPU')
			]);

			const nodes = registry.getNodeList({})

			nodes.map(node => {

				let cpuLoad = '?';
				if (node.cpu !== null) {
					const width = 20
					const c = Math.round(node.cpu / (100 / width))
					cpuLoad = ['['].concat(Array(c).fill('■'), Array(width - c).fill('.'), ['] ', node.cpu.toFixed(0), '%']).join('')
				}

				data.push([
					node.id === state.nodeId ? `${node.id}(*)` : node.id,
					node.services ? Object.keys(node.services).length : 0,
					node.client.version,
					node.client.type,
					node.IPList[0],
					node.isAvailable ? chalk.bgGreen.black(' ONLINE '):chalk.bgRed.white.bold(' OFFLINE '),
					cpuLoad
				])
			})
			const tableConf = {}

			console.log(table(data, tableConf));
			done()
		})


	vorpal
		.command('services', 'List services')
		.action((args, done) => {
			const data =[]
			data.push([
				chalk.bold('Service'),
				chalk.bold('Version'),
				chalk.bold('State'),
				chalk.bold('Actions'),
				chalk.bold('Events'),
				chalk.bold('Nodes')
			]);

			const list = []
			const services = registry.getServiceList({ withActions: true, withEvents: true })
			//console.log(services)
			services.map(service => {
				let item = list.find(i => i.nodeId === service.nodeId)
				if (item) {
					item.nodes.push({
						nodeId: service.nodeId,
						isAvailable: service.isAvailable
					})
				} else {
					item = Object.create(null)
					item.name = service.name,
					item.version = service.version ? service.version : 1
					item.isAvailable = service.isAvailable
					item.actions = service.actions ? Object.keys(service.actions).length : 0
					item.events = service.events ? Object.keys(service.events).length : 0
					item.nodes = [{
						nodeId: service.nodeId,
						isAvailable: service.isAvailable
					}]
					list.push(item)
				}
				
			})

			list.map(service => {
				data.push([
					service.name,
					service.version ? service.version : 1,
					service.isAvailable ? chalk.bgGreen.black('  OK  ') : chalk.bgRed.white.bold(' FAILURE '),
					service.actions,
					service.events,
					service.nodes.length
				])
			})

			const tableConf = {}

			console.log(table(data, tableConf));
			done()
		})


	vorpal
		.command('actions', 'List actions')
		.action((args, done) => {
			const data =[]
			data.push([
				chalk.bold('Action'),
				chalk.bold('Nodes'),
				chalk.bold('State'),
				chalk.bold('Cached'),
				chalk.bold('Params'),
			]);

			const list = []
			const actions = registry.getActionList({ withEndpoints: true })
			actions.map(item => {
				const action = item.action
				const params = action && action.params ? Object.keys(action.params).join(', ') : ''

				if(action) {
					data.push([
						action.name,
						item.hasLocal ? `(*)${item.count}` : item.count,
						item.hasAvailable ? chalk.bgGreen.black('  OK  ') : chalk.bgRed.white.bold(' FAILURE '),
						action.cache ? chalk.green('Yes') : chalk.gray('No'),
						params
					])
				}
			})
			// services.map(service => {
			// 	let item = list.find(i => i.nodeId === service.nodeId)
			// 	if (item) {
			// 		item.nodes.push({
			// 			nodeId: service.nodeId,
			// 			isAvailable: service.isAvailable
			// 		})
			// 	} else {
			// 		item = Object.create(null)
			// 		item.name = service.name,
			// 		item.version = service.version ? service.version : 1
			// 		item.isAvailable = service.isAvailable
			// 		item.actions = service.actions ? Object.keys(service.actions).length : 0
			// 		item.events = service.events ? Object.keys(service.events).length : 0
			// 		item.nodes = [{
			// 			nodeId: service.nodeId,
			// 			isAvailable: service.isAvailable
			// 		}]
			// 		list.push(item)
			// 	}
				
			// })


			list.map(service => {
				data.push([
					service.name,
					service.version ? service.version : 1,
					service.isAvailable ? chalk.bgGreen.black('  OK  ') : chalk.bgRed.white.bold(' FAILURE '),
					service.actions,
					service.events,
					service.nodes.length
				])
			})

			const tableConf = {}

			console.log(table(data, tableConf));
			done()
		})
    // exit command
    vorpal
		.command('q', 'Exit application')
		.alias('quit')
		.alias('exit')
		.action((args, done) => {
			stop().then(() => process.exit(0))
			done()
        })
        
    vorpal
        .command('call <actionName> [jsonParams]', 'Call an action.')
        .autocomplete({
			data() {
				return _.uniq(registry.getActionList({}).map(item => item.name));
			}
		})
		.allowUnknownOptions()
		.action((args, done) => {
			let payload
			if (typeof(args.jsonParams) == 'string') {
				try {
					payload = JSON.parse(args.jsonParams)
				} catch (error) {
					console.log(error.message)
					done()
				}
            } else {
				payload = convertArgs(args.options)
            }

			console.log(chalk.yellow.bold(`>> Call '${args.actionName}' with params:`), payload)
			call(args.actionName, payload)
				.then(res => {
					console.log(chalk.yellow.bold('>> Response:'))
					console.log(util.inspect(res, { showHidden: false, depth: 4, colors: true }))
				})
				.catch(err => {
					console.error(chalk.red.bold('>> ERROR:', err.message))
					console.error(chalk.red.bold(err.stack))
					console.error('Data: ', util.inspect(err.data, { showHidden: false, depth: 4, colors: true }))
				})
				.finally(done)
        })
		
	vorpal
        .command('dcall <nodeId> <actionName> [jsonParams]', 'Direct call an action.')
        .autocomplete({
			data() {
				return _.uniq(registry.getActionList({}).map(item => item.action.name));
			}
		})
		.allowUnknownOptions()
		.action((args, done) => {
			let payload
			if (typeof(args.jsonParams) == 'string') {
				try {
					payload = JSON.parse(args.jsonParams)
				} catch (error) {
					console.log(error.message)
					done()
				}
            } else {
				payload = convertArgs(args.options)
            }

			const nodeId = args.nodeId
			console.log(chalk.yellow.bold(`>> Call '${args.actionName}' with params:`), payload)
			call(args.actionName, payload, { nodeId })
				.then(res => {
					console.log(chalk.yellow.bold('>> Response:'))
					console.log(util.inspect(res, { showHidden: false, depth: 4, colors: true }))
				})
				.catch(err => {
					console.error(chalk.red.bold('>> ERROR:', err.message))
					console.error(chalk.red.bold(err.stack))
					console.error('Data: ', util.inspect(err.data, { showHidden: false, depth: 4, colors: true }))
				})
				.finally(done)
        })
        

    vorpal
        .command('info', 'Show node informations.')
        .action((args, done) => {
            const printHeader = (name) => {
				const title = `   ${name}   `
				const lines = '='.repeat(title.length)
				console.log(chalk.yellow.bold(lines))
				console.log(chalk.yellow.bold(title))
				console.log(chalk.yellow.bold(lines))
				console.log('');	
			}

			const print = (caption, value) => {
				console.log('   ', _.padEnd(caption, 25) + (value != null ? ': ' + chalk.bold(value) : ''))
			}

			done()
		})

	vorpal
		.command('bench <action> [jsonParams]', 'Benchmark a service Endpoint.')
		.option("--iterations <number>", "Number of iterations")
		.option("--time <seconds>", "Time of bench")
		.option("--nodeID <nodeID>", "NodeID (direct call)")
		.autocomplete({
			data() {
				return _.uniq(registry.getActionList({}).map(item => item.name));
			}
		})
        .action((args, done) => {
			const spinner = createSpinner('🚀  Running benchmark... ')
			const action = args.action

			let time = args.options.time != null ? Number(args.options.time) : null
			let payload

			if (!time) {
				time = 5
			}

			if (typeof(args.jsonParams) === 'string') {
				try {
					payload = JSON.parse(args.jsonParams)
				} catch (error) {
					console.log(error.message)
					done()
				}
			}

			let timeout = false
			let requestCounter = 0
			let responseCounter = 0
			let errorCounter = 0

			let sumTime = 0
			let minTime = null
			let maxTime = null

			spinner.start()
			const startTotalTime = process.hrtime()

			const timr = setTimeout(() => {
				timeout = true
			}, (time ? time : 60) * 1000)

			const printResult = (duration) => {
				console.log(chalk.green.bold("\nBenchmark results:\n"))
				console.log(chalk.bold(`${formatNumber(responseCounter)} requests in ${humanize(duration)}`))
				console.log(`Requests/second: ${chalk.bold(formatNumber(responseCounter / duration * 1000))}`)
				console.log(`	Avg time: ${chalk.bold(humanize(sumTime / responseCounter))}`)
				console.log(`	Min time: ${chalk.bold(humanize(minTime))}`)
				console.log(`	Max time: ${chalk.bold(humanize(maxTime))}`)
			}

			const handleRequest = (startTime, error) => {
				if (error) {
					errorCounter++
				}
				responseCounter++

				const diff = process.hrtime(startTime)
				const duration = (diff[0] + diff[1] / 1e9) * 1000
				
				sumTime += duration


				if (minTime === null || duration < minTime) {
					minTime = duration
				}

				if (maxTime === null || duration > maxTime) {
					maxTime = duration
				}

				if (timeout) {
					spinner.stop()
					const diffTotal = process.hrtime(startTotalTime)
					const durationTotal = (diffTotal[0] + diffTotal[1] / 1e9) * 1000
					printResult(durationTotal)
					return done()
				}
				if (requestCounter % 10 * 1000) {
					doRequest()
				} else {
					setImmediate(() => doRequest())
				}
			}

			const doRequest = () => {
				requestCounter++
				const startTime = process.hrtime()
				return call(action, payload)
					.then(result => {
						handleRequest(startTime)
						return result
					})
					.catch(error => {
						handleRequest(startTime, error)
					})
			}
			doRequest()
		})
		
	vorpal
		.command('statistics', 'List services')
		.alias('stats')
		.action((args, done) => {
			if (!statistics) {
				console.log(chalk.red.bold('Statistics are not enabled on this node.'))
			} else {
				const data =[]
				
				data.push([
					chalk.bold('Actions'),
					chalk.bold('Requests'),
					chalk.bold('Latency')
				]);
	
				const list = []
				const snapshot = statistics.getSnapshot()
				
				const actions = snapshot.requests.actions
				const total = snapshot.requests.total

				Object.keys(actions).map(key => {
					const action = actions[key]
					list.push({
						name: key,
						count: action.count,
						latency: action.latency ? action.latency.mean : '-'
					})
				})

				list.map((action) => {
					data.push([
						action.name,
						action.count,
						action.latency
					])
				})
				const tableConf = {}
				console.log(table(data, tableConf));
			}done()
		})

    vorpal
		.delimiter('weave $')
		.show()
}