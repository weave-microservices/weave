const { createHistogram } = require('../../../../lib/metrics/types/histogram');
const { createNode } = require('../../../helper');

describe('Test Histogram', () => {
  it('should generate a histogram', () => {
    const broker = createNode({
      logger: {
        enabled: false
      },
      metrics: {
        enabled: true
      }
    });

    const storage = broker.runtime.metrics;

    const histogram = createHistogram(storage, { name: 'requests', description: 'description', labels: ['service'], buckets: true });
    histogram.observe(1, { service: 'test-service' });
    histogram.observe(2, { service: 'test-service1' }, new Date());
    histogram.observe(1, { service: 'test-service' });
    histogram.observe(4, { service: 'test-service2' }, new Date());
    histogram.observe(1, { service: 'test-service' }, new Date());
    histogram.observe(9, { service: 'test-service3' }, new Date());
    histogram.observe(9, { service: 'test-service' }, new Date());
  });
});
