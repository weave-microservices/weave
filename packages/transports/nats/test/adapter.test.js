const { Weave } = require('@weave-js/core');
const NATSTransport = require('../lib/index');

describe('NATS transport adapter', () => {
  let broker1;
  let broker2;
  const startedHook1 = jest.fn();
  const startedHook2 = jest.fn();

  beforeEach(async () => {
    broker1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      namespace: 'nats',
      transport: {
        adapter: NATSTransport()
      },
      started: startedHook1
    });

    broker1.createService({
      name: 'testService1',
      actions: {
        hello (context) {
          return 'Hello from ' + context.nodeId;
        }
      }
    });

    broker2 = Weave({
      nodeId: 'node2',
      logger: {
        enabled: false
      },
      namespace: 'nats',
      transport: {
        adapter: NATSTransport()
      },
      started: startedHook2
    });

    broker2.createService({
      name: 'testService2',
      actions: {
        hello (context) {
          return 'Hello from ' + this.broker.nodeId;
        }
      }
    });

    await Promise.all([broker1.start(), broker2.start()]);
  });

  afterEach(async () => {
    await Promise.all([broker1.stop(), broker2.stop()]);
  });

  it('should connect', () => {
    expect(startedHook1).toBeCalledTimes(1);
    expect(startedHook2).toBeCalledTimes(1);
  });

  it('should get node info', () => {
    return broker1
      .waitForServices(['testService2'])
      .then(() => {
        return broker1.call('testService2.hello');
      })
      .then(result => {
        expect(result).toBe('Hello from node2');
      });
  });
});
