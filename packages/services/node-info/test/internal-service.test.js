const { createBroker } = require('@weave-js/core');
const nodeService = require('../lib/node-service');

describe('Test internal service $node', () => {
  it('Five actions from "$node" should be available.', (done) => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    broker1.createService(nodeService);

    broker1.start().then(() => {
      broker1.call('$node.actions', { withActions: true })
        .then(res => {
          expect(res.length).toBe(4);
          done();
        });
    });
  });

  it('shlould get one service from service node.', (done) => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    broker1.createService(nodeService);

    broker1.start().then(() => {
      broker1.call('$node.services', { withNodeService: true })
        .then(res => {
          expect(res.length).toBe(1);
          done();
        });
    });
  });

  it('shlould get no event node service.', (done) => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    broker1.createService(nodeService);

    broker1.start().then(() => {
      broker1.call('$node.events', { withNodeService: true })
        .then(res => {
          expect(res.length).toBe(0);
          done();
        });
    });
  });

  it('shlould get a list of all connected nodes', (done) => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    broker1.createService(nodeService);

    broker1.start().then(() => {
      broker1.call('$node.list')
        .then(res => {
          expect(res.length).toBe(1);
          done();
        });
    });
  });
});
