const { createNode } = require('../../helper');
const Constants = require('../../../src/metrics/constants');
const defaultSettings = {
  logger: {
    enabled: false
  },
  metrics: {
    enabled: true
  }
};

describe('Test broker metrics', () => {
  const node = createNode(Object.assign({ nodeId: 'node', namespace: 'test' }, defaultSettings));
  beforeAll(() => Promise.all([
    node.start()
  ]));

  afterAll(() => Promise.all([
    node.stop()
  ]));

  it('should return broker metrics', () => {
    expect(node.runtime.metrics.getMetric(Constants.WEAVE_ENVIRONMENT).value).toBe('Node.js');
    expect(node.runtime.metrics.getMetric(Constants.WEAVE_ENVIRONMENT_VERSION).value).toBe(process.version);
    expect(node.runtime.metrics.getMetric(Constants.WEAVE_NAMESPACE).value).toBe('test');
    expect(node.runtime.metrics.getMetric(Constants.WEAVE_NODE_ID).value).toBe('node');
    expect(node.runtime.metrics.getMetric(Constants.WEAVE_VERSION).value).toBe(node.version);
  });
});

describe('Test metric middleware', () => {
  const node1 = createNode(Object.assign({ nodeId: 'node1' }, defaultSettings));

  beforeAll(() => Promise.all([
    node1.start()
  ]));

  afterAll(() => Promise.all([
    node1.stop()
  ]));

  it('should create a middleware', () => {
    const metric = node1.runtime.metrics.getMetric('weave.requests.total');
    expect(metric.description).toBe('Number of total requests.');
    expect(metric.value).toBe(0);
  });
});
