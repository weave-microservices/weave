const createDiscoveryService = require('../../../../lib/transport/adapters/tcp/discovery/index')
const { getIpList } = require('@weave-js/utils')

const fakeAdapter = (nodeId) => ({
  broker: {
    nodeId,
    options: {
      namespace: ''
    }
  },
  log: {
    info: jest.fn(),
    verbose: jest.fn()
  }
})

const options = {
  discovery: {
    enabled: true,
    port: 1234,
    type: 'udp4',
    udpReuseAddress: true
  }
}

describe('UDP discovery', () => {
  const ips = getIpList(false)

  let discoveryService
  beforeEach(() => {
    discoveryService = createDiscoveryService(fakeAdapter('node1'), options)
  })

  it('should expect interface', async () => {
    expect(discoveryService.bus).toBeDefined()
    expect(discoveryService.start).toBeDefined()
    expect(discoveryService.close).toBeDefined()
  })

  it('should discover', async () => {
    const secondDiscoveryService = createDiscoveryService(fakeAdapter('node2'), options)
    await discoveryService.start(1234)
    await secondDiscoveryService.start(1234)

    const messages = new Map()

    secondDiscoveryService.bus.on('message', (message) => {
      messages.set(message.host, message)
    })

    await new Promise((r) => setTimeout(() => r(), 2000))

    ips.forEach((ip) => {
      const message = messages.get(ip)
      if (!message) return
      expect(ips.includes(message.host)).toBeTruthy()
      expect(message.namespace).toBe('')
      expect(message.nodeId).toBe('node1')
      expect(message.port).toBe(1234)
    })
  })
})
