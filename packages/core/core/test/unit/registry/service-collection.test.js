const { createServiceCollection } = require('../../../lib/registry/collections/serviceCollection');
const { createNode } = require('../../../lib/registry/node');
const { createMockRegistry } = require('../../helper/mock-registry');

describe('Service collection', () => {
  it('should add and list services to a service collection', () => {
    const serviceCollection = createServiceCollection(createMockRegistry({ runtimeOptions: { nodeId: 'test-node' }}));
    const node = createNode('test-node');
    serviceCollection.add(node, 'test-service', '1.0.0', {
      $private: true
    });

    serviceCollection.add(node, 'test-service2', '1.0.0', {});

    const listWithoutPrivate = serviceCollection.list({});
    expect(listWithoutPrivate.length).toBe(1);

    const listWithPrivate = serviceCollection.list({ withPrivate: true });
    expect(listWithPrivate.length).toBe(2);
  });
});
