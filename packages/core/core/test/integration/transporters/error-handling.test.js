const { createNode } = require('../../helper');
const LocalService = require('../../services/local.service');

describe('Remote error handling', () => {
  it('should return results of all connected nodes.', done => {
    const broker1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    });

    const broker2 = createNode({
      nodeId: 'node2',
      logger: {
        enabled: false,
        level: 'fatal'
      },
      transport: {
        adapter: 'dummy'
      }
    });

    broker1.createService(LocalService);

    Promise.all([
      broker1.start(),
      broker2.start()
    ])
      .then(() => broker1.waitForServices(['local']))
      .then(() => broker2.call('local.faultyWeave'))
      .catch((error) => {
        expect(error.code).toBe('WEAVE_ERROR');

        done();
        return Promise.all([
          broker1.stop(),
          broker2.stop()
        ]);
      });
  });
});
