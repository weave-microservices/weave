const { Weave, Errors } = require('../../lib/index')
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

describe('Test "registerLocalService"', () => {
  const broker = Weave(brokerSettings)
  const registry = broker.registry

  registry.services.has = jest.fn()
  registry.services.add = jest.fn(() => ({ name: 'test-service' }))
  registry.registerActions = jest.fn()
  registry.registerEvents = jest.fn()
  registry.serviceChanged = jest.fn()
  registry.generateLocalNodeInfo = jest.fn()

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
    expect(registry.serviceChanged).toBeCalledTimes(1)
    expect(registry.generateLocalNodeInfo).toBeCalledTimes(1)
    expect(registry.nodes.localNode.services.length).toBe(1)
  })
})

describe('Test "registerRemoteServices"', () => {
  const broker = Weave(brokerSettings)
  const registry = broker.registry
  const nodes = createNode('test-node')

  let serviceItem = {
    update: jest.fn()
  }

  registry.services.get = jest.fn(() => null)
  registry.services.add = jest.fn(() => serviceItem)
  registry.registerActions = jest.fn()
  registry.registerEvents = jest.fn()
  registry.serviceChanged = jest.fn()
  registry.generateLocalNodeInfo = jest.fn()

  it('should call methods', () => {
    const node = createNode('test-node')
    const service = {
      name: 'test-service',
      version: 2,
      actions: {
        'users.find' () {}
      },
      events: {},
      methods: {}
    }

    registry.registerRemoteServices(node, [service])

    expect(registry.services.get).toBeCalledTimes(1)
    expect(registry.services.add).toBeCalledTimes(1)
    expect(registry.registerActions).toBeCalledTimes(1)
    expect(registry.registerEvents).toBeCalledTimes(1)
    expect(registry.serviceChanged).toBeCalledTimes(1)
  })

  // it('should handle old actions', () => {
  //   registry.registerActions.mockClear()
  //   registry.registerEvents.mockClear()
  //   registry.serviceChanged.mockClear()
  //   registry.generateLocalNodeInfo.mockClear()

  //   const node = createNode('test-node')
  //   const service = {
  //     name: 'test-service',
  //     version: 2,
  //     actions: {},
  //     events: {},
  //     methods: {}
  //   }

  //   registry.registerRemoteServices(node, [service])

  //   expect(registry.registerActions).toBeCalledTimes(2)
  //   expect(registry.registerEvents).toBeCalledTimes(2)
  //   expect(registry.serviceChanged).toBeCalledTimes(1)
  // })

  it('should update actions, events methods', () => {
    registry.registerActions.mockClear()
    registry.registerEvents.mockClear()
    registry.serviceChanged.mockClear()

    serviceItem = {
      name: 'test-service',
      fullName: 'v2.test-service',
      version: 2,
      metadata: {},
      node: nodes,
      update: jest.fn(),
      equals: jest.fn(() => false),
      actions: {
        'users.find' () {},
        'users.get' () {}
      },
      events: {
        'user.created' () {},
        'user.removed' () {}
      }
    }

    registry.services.get = jest.fn(() => serviceItem)

    const node = createNode('test-node')
    const service = {
      name: 'test-service',
      fullName: 'v2.test-service',
      version: 2,
      actions: {
        'users.find' () {}
      },
      events: {
        'user.created' () {}
      },
      methods: {}
    }

    registry.registerRemoteServices(node, [service])

    expect(serviceItem.update).toBeCalledTimes(1)
    expect(registry.registerActions).toBeCalledTimes(1)
    expect(registry.registerEvents).toBeCalledTimes(1)
    // expect(registry.registerEvents).toBeCalledWith(nodes, serviceItem, service.events)
    expect(registry.serviceChanged).toBeCalledTimes(1)

    registry.services.services.push(serviceItem)
  })

  it('should remove old services', () => {
    registry.services.get = jest.fn()
    registry.services.remove = jest.fn()

    registry.services.add.mockClear()
    registry.registerActions.mockClear()
    registry.registerEvents.mockClear()
    registry.serviceChanged.mockClear()

    const node = createNode('test-node')
    const service = {
      name: 'post'
    }

    registry.registerRemoteServices(node, [service])

    expect(serviceItem.update).toBeCalledTimes(1)
    expect(registry.registerActions).toBeCalledTimes(0)
    expect(registry.registerEvents).toBeCalledTimes(0)
    // expect(registry.registerEvents).toBeCalledWith(nodes, serviceItem, service.events)
    expect(registry.serviceChanged).toBeCalledTimes(1)
  })
})

describe('Test "getNextAvailableActionEndpoint"', () => {
  const broker = Weave(brokerSettings)
  const registry = broker.registry

  it('should return the endpoint if the actionName is not a string', () => {
    const endpoint = {}
    expect(registry.getNextAvailableActionEndpoint(endpoint)).toBe(endpoint)
  })

  it('should try to return an endpoint by specific node id', () => {
    expect(registry.getNextAvailableActionEndpoint('test-action', { nodeId: 'test-node' })).toEqual(new Errors.WeaveServiceNotFoundError({ actionName: 'test-action', nodeId: 'test-node' }))
  })
})
