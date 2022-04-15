const os = require('os');
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
  const node = createNode(Object.assign({ nodeId: 'node-metrics', namespace: 'metrics' }, defaultSettings));
  beforeAll(() => Promise.all([
    node.start()
  ]));

  afterAll(() => Promise.all([
    node.stop()
  ]));

  const { metrics } = node.runtime;

  it('should return broker metrics', () => {
    expect(metrics.getMetric(Constants.WEAVE_ENVIRONMENT).value).toBe('Node.js');
    expect(metrics.getMetric(Constants.WEAVE_ENVIRONMENT_VERSION).value).toBe(process.version);
    expect(metrics.getMetric(Constants.WEAVE_NAMESPACE).value).toBe('metrics');
    expect(metrics.getMetric(Constants.WEAVE_NODE_ID).value).toBe('node-metrics');
    expect(metrics.getMetric(Constants.WEAVE_VERSION).value).toBe(node.version);

    // Process metrics
    expect(metrics.getMetric(Constants.PROCESS_PID).value).toBe(process.pid);
    expect(metrics.getMetric(Constants.PROCESS_PPID).value).toBe(process.ppid);
    expect(metrics.getMetric(Constants.PROCESS_UPTIME).value).toBeLessThan(process.uptime());

    // OS Metrics
    expect(metrics.getMetric(Constants.OS_HOSTNAME).value).toBe(os.hostname());
    expect(metrics.getMetric(Constants.OS_TYPE).value).toBe(os.type());
    expect(metrics.getMetric(Constants.OS_RELEASE).value).toBe(os.release());
    expect(metrics.getMetric(Constants.OS_ARCH).value).toBe(os.arch());
    expect(metrics.getMetric(Constants.OS_PLATTFORM).value).toBe(os.platform());
    // expect(metrics.getMetric(Constants.OS_MEMORY_FREE).value)
    // expect(metrics.getMetric(Constants.OS_MEMORY_USED).value).toBe(os.hostname())
    // expect(metrics.getMetric(Constants.OS_MEMORY_TOTAL).value).toBe(os.hostname())
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
