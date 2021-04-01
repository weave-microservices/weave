const { Weave } = require('../../lib/index')
const HealthCheck = require('../../lib/broker/health')
// const os = require('os')
const pkg = require('../../package.json')

describe('Test utils lib', () => {
  it('Is Object', (done) => {
    const broker = Weave({
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'Dummy'
      }
    })
    broker.start()
      .then(() => {
        const healthCheck = HealthCheck()
        healthCheck.init(broker, broker.transport)

        // CPU Info
        const cpuInfo = healthCheck.getCPUInfos()
        expect(cpuInfo.cores).toBeDefined()
        expect(cpuInfo.utilization).toBeDefined()

        // Client info
        const clientInfo = healthCheck.getClientInfo()
        expect(clientInfo.nodeVersion).toBeDefined()
        expect(clientInfo.type).toBeDefined()
        expect(clientInfo.version).toBeDefined()
        expect(clientInfo.version).toEqual(pkg.version)

        // OS info
        const osInfo = healthCheck.getOsInfos()
        expect(osInfo.hostname).toBeDefined()
        expect(osInfo.plattform).toBeDefined()
        expect(osInfo.release).toBeDefined()
        expect(osInfo.type).toBeDefined()

        // Process info
        const processInfo = healthCheck.getProcessInfos()
        expect(processInfo.pid).toBeDefined()
        expect(processInfo.memory).toBeDefined()
        expect(processInfo.uptime).toBeDefined()

        // todo: check mem sizes

        // Memory info
        const memInfo = healthCheck.getMemoryInfos()
        expect(memInfo.totalMemory).toBeDefined()
        expect(memInfo.freeMemory).toBeDefined()

        // Transport info
        const transportInfo = healthCheck.getTransportInfos()
        expect(transportInfo).toBeDefined()

        const brokerInfo = healthCheck.getNodeHealthInfo()
        expect(brokerInfo.nodeId).toBeDefined()
        expect(brokerInfo.os).toBeDefined()
        expect(brokerInfo.cpu).toBeDefined()
        expect(brokerInfo.memory).toBeDefined()
        expect(brokerInfo.process).toBeDefined()
        expect(brokerInfo.client).toBeDefined()
        expect(brokerInfo.transport).toBeDefined()

        done()
      })
  })
})

