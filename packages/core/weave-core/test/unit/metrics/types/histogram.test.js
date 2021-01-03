const Histogram = require('../../../../lib/metrics/types/histogram')
const MetricStorage = require('../../../../lib/metrics/registry')
const { Weave } = require('../../../../lib')

describe('Test Histogram', () => {
  it('should generate a histogram', () => {
    const broker = Weave({})
    const storage = MetricStorage(broker, broker.options.metrics)
    storage.init()
    const histogram = new Histogram(storage, { name: 'requests', description: 'description', labels: ['service'], buckets: true })
    histogram.observe(1, { service: 'test-service' })
    histogram.observe(2, { service: 'test-service1' }, new Date())
    histogram.observe(1, { service: 'test-service' })
    histogram.observe(4, { service: 'test-service2' }, new Date())
    histogram.observe(1, { service: 'test-service' }, new Date())
    histogram.observe(9, { service: 'test-service3' }, new Date())
    histogram.observe(9, { service: 'test-service' }, new Date())
  })
})