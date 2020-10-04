const { Weave } = require('../../lib/index')
const { createNode } = require('../../lib/registry/node')
const { createRegistry } = require('../../lib/registry/registry')

const brokerSettings = {
  logger: {
    enabled: false
  }
}

describe('Test Registry instance', () => {
  const broker = Weave(brokerSettings)

  it('test registry properties', () => {
    const middlewareHandler = jest.fn()
    const serviceChanged = jest.fn()
    const registry = createRegistry()

    expect(registry.init).toBeDefined()
    expect(registry.nodeDisconnected).toBeDefined()
    expect(registry.onRegisterLocalAction).toBeDefined()
    expect(registry.onRegisterRemoteAction).toBeDefined()
    expect(registry.processNodeInfo).toBeDefined()
    expect(registry.processNodeInfo).toBeDefined()
    expect(registry.registerActions).toBeDefined()
    expect(registry.registerActions).toBeDefined()
    expect(registry.registerEvents).toBeDefined()
    expect(registry.registerLocalService).toBeDefined()
    expect(registry.registerRemoteServices).toBeDefined()
    expect(registry.removeNode).toBeDefined()

    registry.init(broker, middlewareHandler, serviceChanged)

    expect(registry.log).toBeDefined()
    expect(registry.services).toBeDefined()
    expect(registry.actions).toBeDefined()
    expect(registry.events).toBeDefined()
  })
})

describe.only('Test "registerLocalService"', () => {
  const broker = Weave(brokerSettings)
  const registry = broker.registry

  registry.services.has = jest.fn()
  registry.services.add = jest.fn()
  registry.registerActions = jest.fn()
  registry.registerEvents = jest.fn()

  it('should call methods', () => {
    const service = {
      name: 'test-service',
      version: 2,
      actions: {},
      events: {},
      methods: {}
    }

    registry.registerLocalService(service)

    expect(registry.services.has).toBeCalledTimes(1)
    expect(registry.services.add).toBeCalledTimes(1)
    expect(registry.registerActions).toBeCalledTimes(1)
    expect(registry.registerEvents).toBeCalledTimes(1)
  })
})
