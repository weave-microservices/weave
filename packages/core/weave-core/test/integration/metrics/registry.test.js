const { createNode } = require('../../helper')

const defaultSettings = {
  logger: {
    enabled: false
  },
  metrics: {
    enabled: true
  }
}

describe('Test metric middleware', () => {
  const node1 = createNode(Object.assign({ nodeId: 'node1' }, defaultSettings))

  beforeAll(() => Promise.all([
    node1.start()
  ]))

  afterAll(() => Promise.all([
    node1.stop()
  ]))

  it('should create a middleware', () => {
    const metric = node1.runtime.metrics.getMetric('weave.requests.total')
    expect(metric.description).toBe('Number of total requests.')
    expect(metric.value).toBe(0)
  })
})
