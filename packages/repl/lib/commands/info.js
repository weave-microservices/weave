const chalk = require('chalk')
const _ = require('lodash')
const os = require('os')
const clui = require('clui')
const v8 = require('v8')

module.exports = (vorpal, broker) => {
  const printHeader = (name, length = 30) => {
    const lines = '-'.repeat(length)
    console.log(' ')
    console.log(chalk.red(lines))
    console.log(chalk.red.bold('| ' + name))
    console.log(chalk.red(lines))
    console.log(' ')
  }

  const print = (caption, value) => {
    console.log(' ', _.padEnd(caption, 25) + (value != null ? ': ' + chalk.bold(value) : ''))
  }

  vorpal
    .command('info', 'Show node informations. (in development)')
    .action((args, done) => {
      const gauge = clui.Gauge
      const brokerHealth = broker.health.getNodeHealthInfo()
      const heapStatistic = v8.getHeapStatistics()

      printHeader('System informations')
      print('CPU', `Architecture: ${os.arch()}/Cores: ${os.cpus().length}`)
      print('Memory', gauge(50, 100, 30))
      print('Heap', gauge(heapStatistic.used_heap_size, heapStatistic.heap_size_limit, 30))
      printHeader('Broker informations')
      print('Weave version', 'v' + brokerHealth.client.version)
      print('Node.js version', brokerHealth.client.nodeVersion)

      if (broker.options.namespace) {
        print('Namespace', broker.options.namespace)
      }

      if (broker.transport) {
        printHeader('Transport informations')
        print('Transporter name', !broker.transport ? 'none' : broker.transport.adapterName)
        print('Adapter is connected?', broker.transport.isConnected)
        print('Adapter is ready?', broker.transport.isReady)
        print('Packages sent', broker.transport.statistics.sent.packages)
        print('Packages received', broker.transport.statistics.received.packages)
      }

      done()
    })
}
