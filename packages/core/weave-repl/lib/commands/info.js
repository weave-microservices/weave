const os = require('os')
const clui = require('clui')
const v8 = require('v8')
const { getIpList } = require('@weave-js/utils')

module.exports = ({ vorpal, broker, cliUI }) => {
  vorpal
    .command('info', 'Show node informations.')
    .action((_, done) => {
      const gauge = clui.Gauge
      const heapStatistic = v8.getHeapStatistics()
      const ips = getIpList(false)

      // System informations
      cliUI.printHeader('System informations')
      cliUI.printIntended('Hostname', os.hostname())
      cliUI.printIntended('CPU', `Architecture: ${os.arch()}/Cores: ${os.cpus().length}`)
      cliUI.printIntended('Memory', gauge(50, 100, 30))
      cliUI.printIntended('Heap', gauge(heapStatistic.used_heap_size, heapStatistic.heap_size_limit, 30))
      cliUI.printIntended('IP', ips.join(', '))

      // Instance related informations
      cliUI.printHeader('Broker informations')
      cliUI.printIntended('Node ID', broker.runtime.nodeId)
      if (broker.runtime.options.namespace) {
        cliUI.printIntended('Namespace', broker.runtime.options.namespace)
      }
      // cliUI.printIntended('Weave version', 'v' + brokerHealth.client.version)
      // cliUI.printIntended('Node.js version', brokerHealth.client.nodeVersion)

      // Transport informations
      if (broker.runtime.transport) {
        cliUI.printHeader('Transport informations')
        cliUI.printIntended('Transporter name', !broker.runtime.transport ? 'none' : broker.runtime.transport.adapterName)
        cliUI.printIntended('Adapter is connected?', broker.runtime.transport.isConnected)
        cliUI.printIntended('Adapter is ready?', broker.runtime.transport.isReady)
        cliUI.printIntended('Packages sent', broker.runtime.transport.statistics.sent.packages)
        cliUI.printIntended('Packages received', broker.runtime.transport.statistics.received.packages)
      }

      done()
    })
}
