const { createBroker } = require('../../../lib/index')
// const utils = require('../../../lib/utils')

const { createMetricsMiddleware } = require('../../../lib/middlewares/metrics')
// const Context = require('../../../lib/broker/context')

const config = {
  logger: {
    enabled: false,
    logLevel: 'fatal'
  },
  metrics: {
    enabled: true
  }
}
// const SlowService = require('../../services/slow.service')

describe('Test metrics middleware', () => {
  const broker = createBroker(config)
  // const contentFactory = createContextFactory()
  const handler = jest.fn(() => Promise.resolve('hooray!!!'))
  const middleware = createMetricsMiddleware()
  const service = {}
  const action = {
    name: 'math.add',
    handler,
    service
  }

  // const endpoint = {
  //   action,
  //   node: {
  //     id: broker.nodeID
  //   }
  // }

  it('should register hooks', () => {
    expect(middleware.localAction).toBeDefined()
  })

  it('should not wrap handler if bulkhead is disabled', () => {
    broker.options.metrics.enabled = false

    const newHandler = middleware.localAction.call(broker, handler, action)
    expect(newHandler).toBe(handler)
  })
})
