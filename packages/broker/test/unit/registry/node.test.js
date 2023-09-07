const { createNode } = require('../../../lib/registry/node');

const createMockPayload = () => {
  return {
    sequence: 1,
    services: [],
    events: [],
    client: {
      type: 'node.js',
      version: '0.1'
    },
    IPList: [],
    info: {},
    cpu: 20,
    cpuSequence: 2
  };
};

describe('Node instance', () => {
  it('should create a node instance', () => {
    const node = createNode('test-node');

    expect(node.id).toBe('test-node');
    expect(node.isAvailable).toBe(true);
    expect(node.isLocal).toBe(false);
    expect(node.info).toBe(null);
    expect(node.cpu).toBe(null);
    expect(node.cpuSequence).toBe(null);
    expect(node.events).toBe(null);
    expect(Array.isArray(node.IPList)).toBe(true);
    expect(node.lastHeartbeatTime).toBeDefined();
    expect(node.offlineTime).toBe(null);
  });
});

describe('Node lifetime', () => {
  const node = createNode('test-node');
  let lastHeartbeat;

  it('should create a node instance', () => {
    expect(node.isAvailable).toBe(true);
    lastHeartbeat = node.lastHeartbeatTime;
  });

  it('should handle heartbeat', () => {
    const payload = createMockPayload();
    node.heartbeat(payload);
    expect(node.lastHeartbeatTime).toBeGreaterThan(lastHeartbeat);
    expect(node.cpu).toBe(20);
    expect(node.cpuSequence).toBe(2);
  });

  it('should handle disconnect and set unavailable', () => {
    node.disconnected();
    expect(node.offlineTime).toBeGreaterThan(0);
    expect(node.isAvailable).toBe(false);
    expect(node.sequence).toBe(1);
  });

  it('should set node available after a new heartbeat package', () => {
    const payload = createMockPayload();
    node.heartbeat(payload);
    expect(node.offlineTime).toBe(null);
    expect(node.isAvailable).toBe(true);
    expect(node.sequence).toBe(1);
  });
});
