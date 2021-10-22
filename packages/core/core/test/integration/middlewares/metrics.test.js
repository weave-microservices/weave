const { Weave } = require('../../../lib/index')
const Constants = require('../../../lib/metrics/constants')
const contextTracker = require('../../../lib/middlewares/context-tracker')
describe('Metric middleware', () => {
  let broker

  beforeEach(() => {
    broker = Weave({
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
    broker = Weave({
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

    expect(metrics.getMetric(Constants.CACHE_GET_TOTAL).value).toBe(1)
    expect(metrics.getMetric(Constants.CACHE_FOUND_TOTAL).value).toBe(1)

  })
})