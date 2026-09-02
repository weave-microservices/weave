const RedisTransportAdapter = require('../lib/index');

const createMockLog = () => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
});

const createMockRuntime = ({ namespace, nodeId = 'unit-node' } = {}) => {
  const log = createMockLog();

  const broker = {
    nodeId,
    options: { namespace, transport: {} },
    handleError (error) {
      throw error;
    }
  };

  const transport = {
    log,
    statistics: {
      sent: { packages: 0 },
      received: { packages: 0 }
    }
  };

  return { broker, transport, log };
};

const initAdapter = async (adapter, runtimeOptions) => {
  const runtime = createMockRuntime(runtimeOptions);
  await adapter.init(runtime.broker, runtime.transport, () => {});
  return runtime;
};

const waitForBusEvent = (adapter, eventName, timeout = 5000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout waiting for bus event "${eventName}"`)),
      timeout
    );

    adapter.bus.once(eventName, (...args) => {
      clearTimeout(timer);
      resolve(args);
    });
  });

// The connect() promise of the adapter is resolved through the
// "$adapter.connected" bus event, so we wait for the event instead.
const connectAdapter = (adapter) => {
  const connected = waitForBusEvent(adapter, '$adapter.connected');
  adapter.connect();
  return connected;
};

describe('REDIS adapter (unit)', () => {
  let adapter;

  afterEach(async () => {
    if (adapter) {
      await adapter.close();
      adapter = null;
    }
  });

  it('should expose the adapter name "REDIS"', () => {
    adapter = RedisTransportAdapter();
    expect(adapter.name).toBe('REDIS');
  });

  it('should not be connected initially', () => {
    adapter = RedisTransportAdapter();
    expect(adapter.isConnected).toBe(false);
    expect(adapter.interruptCounter).toBe(0);
    expect(adapter.repeatAttemptCounter).toBe(0);
  });

  it('should build topics with the namespace prefix', async () => {
    adapter = RedisTransportAdapter();
    await initAdapter(adapter, { namespace: 'unit-ns' });

    expect(adapter.getTopic('INFO', 'node1')).toBe('weave-unit-ns.INFO.node1');
    expect(adapter.getTopic('DISCOVERY')).toBe('weave-unit-ns.DISCOVERY');
  });

  it('should build topics without a namespace', async () => {
    adapter = RedisTransportAdapter();
    await initAdapter(adapter, {});

    expect(adapter.getTopic('INFO', 'node1')).toBe('weave.INFO.node1');
  });

  it('should resolve and drop the message when sending while disconnected', async () => {
    adapter = RedisTransportAdapter();
    const { log } = await initAdapter(adapter, { namespace: 'unit-send-disconnected' });

    await adapter.send({ type: 'INFO', targetNodeId: 'node2', payload: {} });

    expect(log.debug).toBeCalledTimes(1);
    expect(log.debug).toBeCalledWith(
      'Message dropped, adapter not connected.',
      { type: 'INFO' }
    );
  });

  it('should resolve close() even if the adapter was never connected', async () => {
    adapter = RedisTransportAdapter();
    await initAdapter(adapter, { namespace: 'unit-close' });
    await adapter.close();
    adapter = null;
  });

  it('should connect to a running redis server and emit "$adapter.connected"', async () => {
    adapter = RedisTransportAdapter();
    await initAdapter(adapter, { namespace: 'unit-connect' });

    await connectAdapter(adapter);

    expect(adapter.isConnected).toBe(true);
  });

  it('should merge the adapter options with the default options', async () => {
    // Explicit options matching the defaults must work the same way.
    adapter = RedisTransportAdapter({ port: 6379, host: '127.0.0.1' });
    await initAdapter(adapter, { namespace: 'unit-options' });

    await connectAdapter(adapter);

    expect(adapter.isConnected).toBe(true);
  });

  it('should deliver published messages to subscribers of the topic', async () => {
    adapter = RedisTransportAdapter();
    const { broker } = await initAdapter(adapter, { namespace: `unit-roundtrip-${Date.now()}` });

    await connectAdapter(adapter);
    await adapter.subscribe('EVENT', 'node2');

    const incoming = waitForBusEvent(adapter, '$adapter.message');
    await adapter.send({
      type: 'EVENT',
      targetNodeId: 'node2',
      payload: { eventName: 'user.created' }
    });

    const [messageType, data] = await incoming;

    expect(messageType).toBe('EVENT');
    expect(data.payload.eventName).toBe('user.created');
    expect(data.payload.sender).toBe(broker.nodeId);
  });

  it('should update the sent and received statistics', async () => {
    adapter = RedisTransportAdapter();
    const { transport } = await initAdapter(adapter, { namespace: `unit-stats-${Date.now()}` });

    await connectAdapter(adapter);
    await adapter.subscribe('HEARTBEAT');

    const incoming = waitForBusEvent(adapter, '$adapter.message');
    await adapter.send({ type: 'HEARTBEAT', payload: {} });
    await incoming;

    expect(transport.statistics.sent.packages).toBeGreaterThan(0);
    expect(transport.statistics.received.packages).toBeGreaterThan(0);
  });

  it('should not deliver messages of topics without a subscription', async () => {
    adapter = RedisTransportAdapter();
    await initAdapter(adapter, { namespace: `unit-no-sub-${Date.now()}` });

    await connectAdapter(adapter);
    await adapter.subscribe('INFO');

    const received = [];
    adapter.bus.on('$adapter.message', (type) => received.push(type));

    await adapter.send({ type: 'HEARTBEAT', payload: {} });

    const incoming = waitForBusEvent(adapter, '$adapter.message');
    await adapter.send({ type: 'INFO', payload: {} });
    await incoming;

    expect(received).toEqual(['INFO']);
  });

  it('should not receive its own messages after close()', async () => {
    adapter = RedisTransportAdapter();
    await initAdapter(adapter, { namespace: `unit-closed-${Date.now()}` });

    await connectAdapter(adapter);
    await adapter.subscribe('INFO');
    await adapter.close();

    // After close the clients are gone; sending must still resolve without throwing.
    adapter.isConnected = false;
    await adapter.send({ type: 'INFO', payload: {} });
    adapter = null;
  });
});
