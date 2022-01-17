const { TransportAdapters } = require('../../../lib/index')
const Constants = require('../../../lib/metrics/constants')
const { createNode } = require('../../helper')

describe('Metric middleware', () => {
  let broker

  beforeEach(() => {
    broker = createNode({
      nodeId: 'node-metrics',
      logger: {
        enabled: false
      },
      metrics: {
        enabled: true
      }
    })

    broker.createService({
      name: 'test-service',
      actions: {
        testAction () {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve('hello')
            }, 2000)
          })
        },
        throwError () {
          throw new Error('not found')
        }
      }
    })

    return broker.start()
  })

  afterEach(() => broker.stop())

  it('should update the request metrics', (done) => {
    const metrics = broker.runtime.metrics
    const p = broker.call('test-service.testAction')

    expect(metrics.getMetric(Constants.REQUESTS_IN_FLIGHT).value).toBe(1)

    p.then(() => {
      expect(metrics.getMetric(Constants.REQUESTS_TOTAL).value).toBe(1)
      expect(metrics.getMetric(Constants.REQUESTS_TIME).value).toBeGreaterThan(2000)
      done()
    })
  })

  it('should update the request metrics on Error', (done) => {
    const metrics = broker.runtime.metrics
    const p = broker.call('test-service.throwError')

    expect(metrics.getMetric(Constants.REQUESTS_IN_FLIGHT).value).toBe(1)

    p.catch((_) => {
      expect(metrics.getMetric(Constants.REQUESTS_TOTAL).value).toBe(1)
      expect(metrics.getMetric(Constants.REQUESTS_TIME).value).toBeGreaterThan(0)
      expect(metrics.getMetric(Constants.REQUESTS_ERRORS_TOTAL).value).toBe(1)
      done()
    })
  })

  // it('should throw an timeout after timeout', (done) => {
  //   return broker.call('test-service.testAction', null, { timeout: 3000 })
  //     .then(result => {
  //       expect(result).toBe('hello')
  //     })
  // })
})

describe('Metric middleware [cache]', () => {
  let broker

  beforeEach(() => {
    broker = createNode({
      nodeId: 'node-metrics',
      logger: {
        enabled: false
      },
      metrics: {
        enabled: true
      },
      cache: {
        enabled: true
      }
    })

    broker.createService({
      name: 'test-service',
      actions: {
        testAction: {
          params: {
            name: 'string'
          },
          cache: {
            keys: ['name']
          },
          handler (context) {
            return context.data.name
          }
        }
      }
    })

    return broker.start()
  })

  afterEach(() => broker.stop())

  it('should register metrics', async () => {
    const metrics = broker.runtime.metrics

    expect(metrics.getMetric(Constants.CACHE_GET_TOTAL).value).toBe(0)
    expect(metrics.getMetric(Constants.CACHE_SET_TOTAL).value).toBe(0)
    expect(metrics.getMetric(Constants.CACHE_FOUND_TOTAL).value).toBe(0)
    expect(metrics.getMetric(Constants.CACHE_EXPIRED_TOTAL).value).toBe(0)
    expect(metrics.getMetric(Constants.CACHE_DELETED_TOTAL).value).toBe(0)
    expect(metrics.getMetric(Constants.CACHE_CLEANED_TOTAL).value).toBe(0)

    await broker.call('test-service.testAction', { name: 'Kevin' })
    await broker.call('test-service.testAction', { name: 'Kevin' })

    expect(metrics.getMetric(Constants.CACHE_GET_TOTAL).value).toBe(2)
    expect(metrics.getMetric(Constants.CACHE_FOUND_TOTAL).value).toBe(1)
  })
})

describe('Metric middleware between remote nodes', () => {
  let broker1
  let broker2

  beforeEach(() => {
    broker1 = createNode({
      nodeId: 'node-metrics-1',
      logger: {
        enabled: false
      },
      metrics: {
        enabled: true
      },
      transport: {
        adapter: TransportAdapters.Dummy()
      }
    })

    broker2 = createNode({
      nodeId: 'node-metrics-2',
      logger: {
        enabled: false
      },
      metrics: {
        enabled: true
      },
      transport: {
        adapter: TransportAdapters.Dummy()
      }
    })

    broker2.createService({
      name: 'test-service',
      actions: {
        testAction: {
          params: {
            name: 'string'
          },
          handler (context) {
            return context.data.name
          }
        }
      }
    })

    return Promise.all([
      broker1.start(),
      broker2.start()
    ])
  })

  afterEach(() => Promise.all([
    broker1.stop(),
    broker2.stop()
  ]))

  it('should register metrics', async () => {
    const metrics1 = broker1.runtime.metrics
    const metrics2 = broker2.runtime.metrics

    await broker1.call('test-service.testAction', { name: 'Kevin' })
    await broker1.call('test-service.testAction', { name: 'Kevin' })
    await broker1.call('test-service.testAction', { name: 'Kevin' })

    expect(metrics1.getMetric(Constants.REQUESTS_TOTAL).value).toBe(3)
    expect(metrics1.getMetric(Constants.REQUESTS_IN_FLIGHT).value).toBe(0)

    expect(metrics2.getMetric(Constants.REQUESTS_TOTAL).value).toBe(3)
    expect(metrics2.getMetric(Constants.REQUESTS_IN_FLIGHT).value).toBe(0)
  })
})
