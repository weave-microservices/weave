const { Weave } = require('@weave-js/core');
const REDISTransport = require('../lib/index');

const waitUntil = (predicate, timeout = 5000, interval = 25) =>
  new Promise((resolve, reject) => {
    const startedAt = Date.now();

    const check = () => {
      if (predicate()) {
        return resolve();
      }

      if (Date.now() - startedAt > timeout) {
        return reject(new Error('Timeout while waiting for condition'));
      }

      setTimeout(check, interval);
    };

    check();
  });

describe('REDIS transport adapter', () => {
  const namespace = `redis-test-${process.pid}-${Date.now()}`;
  const startedHook1 = jest.fn();
  const startedHook2 = jest.fn();
  const eventHandler = jest.fn();
  const broadcastHandler1 = jest.fn();
  const broadcastHandler2 = jest.fn();

  let broker1;
  let broker2;

  beforeAll(async () => {
    broker1 = Weave({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      namespace,
      transport: {
        adapter: REDISTransport()
      },
      started: startedHook1
    });

    broker1.createService({
      name: 'testService1',
      actions: {
        hello (context) {
          return 'Hello from ' + context.nodeId;
        },
        greet (context) {
          return `Hello ${context.data.name}!`;
        }
      },
      events: {
        'user.broadcasted': broadcastHandler1
      }
    });

    broker2 = Weave({
      nodeId: 'node2',
      logger: {
        enabled: false
      },
      namespace,
      transport: {
        adapter: REDISTransport()
      },
      started: startedHook2
    });

    broker2.createService({
      name: 'testService2',
      actions: {
        hello () {
          return 'Hello from ' + this.broker.nodeId;
        },
        echo (context) {
          return context.data;
        },
        fail () {
          throw new Error('Expected failure');
        }
      },
      events: {
        'user.created': eventHandler,
        'user.broadcasted': broadcastHandler2
      }
    });

    await Promise.all([broker1.start(), broker2.start()]);

    await Promise.all([
      broker1.waitForServices(['testService2']),
      broker2.waitForServices(['testService1'])
    ]);
  });

  afterAll(() => {
    return Promise.all([broker1.stop(), broker2.stop()]);
  });

  it('should connect and call the started hooks exactly once', () => {
    expect(startedHook1).toBeCalledTimes(1);
    expect(startedHook2).toBeCalledTimes(1);
  });

  it('should discover the remote node', () => {
    const node = broker1.runtime.registry.nodeCollection.get('node2');
    expect(node).toBeDefined();
    expect(node.isAvailable).toBe(true);
  });

  it('should call a remote action (node1 -> node2)', async () => {
    const result = await broker1.call('testService2.hello');
    expect(result).toBe('Hello from node2');
  });

  it('should call a remote action (node2 -> node1)', async () => {
    const result = await broker2.call('testService1.hello');
    expect(result).toBe('Hello from node1');
  });

  it('should pass parameters to a remote action', async () => {
    const result = await broker2.call('testService1.greet', { name: 'Weave' });
    expect(result).toBe('Hello Weave!');
  });

  it('should transfer complex payloads without losing data', async () => {
    const payload = {
      text: 'Hänsel & Grätel äöüß',
      number: 42.5,
      flag: true,
      nothing: null,
      nested: { list: [1, 2, 3], deep: { key: 'value' } }
    };

    const result = await broker1.call('testService2.echo', payload);
    expect(result).toEqual(payload);
  });

  it('should propagate errors of remote actions to the caller', async () => {
    await expect(broker1.call('testService2.fail'))
      .rejects
      .toThrow('Expected failure');
  });

  it('should reject calls to unknown actions', async () => {
    await expect(broker1.call('testService2.unknownAction')).rejects.toThrow();
  });

  it('should deliver emitted events to the remote node', async () => {
    eventHandler.mockClear();

    broker1.emit('user.created', { id: 1 });

    await waitUntil(() => eventHandler.mock.calls.length === 1);

    const context = eventHandler.mock.calls[0][0];
    expect(context.data).toEqual({ id: 1 });
    expect(context.callerNodeId).toBe('node1');
  });

  it('should deliver broadcast events to all nodes', async () => {
    broadcastHandler1.mockClear();
    broadcastHandler2.mockClear();

    broker1.broadcast('user.broadcasted', { id: 2 });

    await waitUntil(() =>
      broadcastHandler1.mock.calls.length === 1 &&
      broadcastHandler2.mock.calls.length === 1
    );

    const remoteContext = broadcastHandler2.mock.calls[0][0];
    expect(remoteContext.data).toEqual({ id: 2 });
  });

  it('should handle multiple parallel remote calls', async () => {
    const results = await Promise.all(
      Array.from({ length: 25 }, (_, index) =>
        broker1.call('testService2.echo', { index })
      )
    );

    results.forEach((result, index) => {
      expect(result).toEqual({ index });
    });
  });

  it('should respond to ping messages of remote nodes', async () => {
    const result = await broker1.ping('node2');
    expect(result.nodeId).toBe('node2');
    expect(typeof result.elapsedTime).toBe('number');
  });
});
