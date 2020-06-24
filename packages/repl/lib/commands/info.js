const os = require('os')
const clui = require('clui')
const v8 = require('v8')
const cliUI = require('../utils/cli-ui')

module.exports = (vorpal, broker) => {
  vorpal
    .command('info', 'Show node informations.')
    .action((args, done) => {
      const gauge = clui.Gauge
      const brokerHealth = broker.health.getNodeHealthInfo()
      const heapStatistic = v8.getHeapStatistics()

      cliUI.printHeader('System informations')
      cliUI.printIntended('CPU', `Architecture: ${os.arch()}/Cores: ${os.cpus().length}`)
      cliUI.printIntended('Memory', gauge(50, 100, 30))
      cliUI.printIntended('Heap', gauge(heapStatistic.used_heap_size, heapStatistic.heap_size_limit, 30))
      cliUI.printHeader('Broker informations')
      cliUI.printIntended('Weave version', 'v' + brokerHealth.client.version)
      cliUI.printIntended('Node.js version', brokerHealth.client.nodeVersion)

      if (broker.options.namespace) {
        cliUI.printIntended('Namespace', broker.options.namespace)
      }

      if (broker.transport) {
        cliUI.printHeader('Transport informations')
        cliUI.printIntended('Transporter name', !broker.transport ? 'none' : broker.transport.adapterName)
        cliUI.printIntended('Adapter is connected?', broker.transport.isConnected)
        cliUI.printIntended('Adapter is ready?', broker.transport.isReady)
        cliUI.printIntended('Packages sent', broker.transport.statistics.sent.packages)
        cliUI.printIntended('Packages received', broker.transport.statistics.received.packages)
      }

      done()
    })
}
