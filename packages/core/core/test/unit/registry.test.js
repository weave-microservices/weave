const { Errors } = require('../../lib/index');
const { createNode } = require('../../lib/registry/node');
const { createRegistry } = require('../../lib/registry/registry');
const { createNode: createBroker } = require('../helper');

const brokerSettings = {
  logger: {
    enabled: false
  }
};

describe('Test Registry instance', () => {
  const broker = createBroker(brokerSettings);

  it('test registry properties', () => {
    const middlewareHandler = jest.fn();
    const serviceChanged = jest.fn();
    const registry = createRegistry(broker.runtime);

    expect(registry.init).toBeDefined();
    expect(registry.nodeDisconnected).toBeDefined();
    expect(registry.onRegisterLocalAction).toBeDefined();
    expect(registry.onRegisterRemoteAction).toBeDefined();
    expect(registry.processNodeInfo).toBeDefined();
    expect(registry.processNodeInfo).toBeDefined();
    expect(registry.registerActions).toBeDefined();
    expect(registry.registerActions).toBeDefined();
    expect(registry.registerEvents).toBeDefined();
    expect(registry.registerLocalService).toBeDefined();
    expect(registry.registerRemoteServices).toBeDefined();
    expect(registry.removeNode).toBeDefined();

    registry.init(broker, middlewareHandler, serviceChanged);

    expect(registry.log).toBeDefined();
    expect(registry.nodeCollection).toBeDefined();
    expect(registry.serviceCollection).toBeDefined();
    expect(registry.actionCollection).toBeDefined();
    expect(registry.eventCollection).toBeDefined();
  });
});

describe('Test "registerLocalService"', () => {
  const broker = createBroker(brokerSettings);
  const registry = broker.registry;

  registry.serviceCollection.has = jest.fn();
  registry.serviceCollection.add = jest.fn(() => ({ name: 'test-service' }));
  registry.registerActions = jest.fn();
  registry.registerEvents = jest.fn();
  registry.generateLocalNodeInfo = jest.fn();
  broker.runtime.services.serviceChanged = jest.fn();

  it('should call methods', () => {
    const service = {
      name: 'test-service',
      version: 2,
      actions: {},
      events: {},
      methods: {}
    };

    registry.registerLocalService(service);

    expect(registry.serviceCollection.has).toBeCalledTimes(1);
    expect(registry.serviceCollection.add).toBeCalledTimes(1);
    expect(registry.registerActions).toBeCalledTimes(1);
    expect(registry.registerEvents).toBeCalledTimes(1);
    expect(broker.runtime.services.serviceChanged).toBeCalledTimes(1);
    expect(registry.generateLocalNodeInfo).toBeCalledTimes(1);
    expect(registry.nodeCollection.localNode.services.length).toBe(1);
  });
});

describe('Test "registerRemoteServices"', () => {
  const broker = createBroker(brokerSettings);
  const registry = broker.registry;
  const nodes = createNode('test-node');

  let serviceItem = {
    update: jest.fn()
  };

  registry.serviceCollection.get = jest.fn(() => null);
  registry.serviceCollection.add = jest.fn(() => serviceItem);
  registry.registerActions = jest.fn();
  registry.registerEvents = jest.fn();
  broker.runtime.services.serviceChanged = jest.fn();
  registry.generateLocalNodeInfo = jest.fn();

  it('should call methods', () => {
    const node = createNode('test-node');
    const service = {
      name: 'test-service',
      version: 2,
      actions: {
        'users.find' () {}
      },
      events: {},
      methods: {}
    };

    registry.registerRemoteServices(node, [service]);

    expect(registry.serviceCollection.get).toBeCalledTimes(1);
    expect(registry.serviceCollection.add).toBeCalledTimes(1);
    expect(registry.registerActions).toBeCalledTimes(1);
    expect(registry.registerEvents).toBeCalledTimes(1);
    expect(broker.runtime.services.serviceChanged).toBeCalledTimes(1);
  });

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
    registry.registerActions.mockClear();
    registry.registerEvents.mockClear();
    broker.runtime.services.serviceChanged.mockClear();

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
    };

    registry.serviceCollection.get = jest.fn(() => serviceItem);

    const node = createNode('test-node');
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
    };

    registry.registerRemoteServices(node, [service]);

    expect(serviceItem.update).toBeCalledTimes(1);
    expect(registry.registerActions).toBeCalledTimes(1);
    expect(registry.registerEvents).toBeCalledTimes(1);
    // expect(registry.registerEvents).toBeCalledWith(nodes, serviceItem, service.events)
    expect(broker.runtime.services.serviceChanged).toBeCalledTimes(1);

    registry.serviceCollection.services.push(serviceItem);
  });

  it('should remove old services', () => {
    registry.serviceCollection.get = jest.fn();
    registry.serviceCollection.remove = jest.fn();

    registry.serviceCollection.add.mockClear();
    registry.registerActions.mockClear();
    registry.registerEvents.mockClear();
    broker.runtime.services.serviceChanged.mockClear();

    const node = createNode('test-node');
    const service = {
      name: 'post'
    };

    registry.registerRemoteServices(node, [service]);

    expect(serviceItem.update).toBeCalledTimes(1);
    expect(registry.registerActions).toBeCalledTimes(0);
    expect(registry.registerEvents).toBeCalledTimes(0);
    // expect(registry.registerEvents).toBeCalledWith(nodes, serviceItem, service.events)
    expect(broker.runtime.services.serviceChanged).toBeCalledTimes(1);
  });
});

describe('Test "getNextAvailableActionEndpoint"', () => {
  const broker = createBroker(brokerSettings);
  const registry = broker.registry;

  it('should return the endpoint if the actionName is not a string', () => {
    const endpoint = {};
    expect(registry.getNextAvailableActionEndpoint(endpoint)).toBe(endpoint);
  });

  it('should try to return an endpoint by specific node id', () => {
    expect(registry.getNextAvailableActionEndpoint('test-action', { nodeId: 'test-node' })).toEqual(new Errors.WeaveServiceNotFoundError({ actionName: 'test-action', nodeId: 'test-node' }));
  });
});
