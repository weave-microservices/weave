const { Weave } = require('../../../lib/index')
const utils = require('@weave-js/utils')

const Middleware = require('../../../lib/middlewares/bulkhead')
const createContextFactory = require('../../../lib/broker/context-factory')

const config = {
  logger: {
    enabled: false,
    logLevel: 'fatal'
  }
}
// const SlowService = require('../../services/slow.service')

describe('Test bulkhead middleware', () => {
  const broker = Weave(config)
  const contentFactory = createContextFactory()
  const handler = jest.fn(() => Promise.resolve('hooray!!!'))
  const middleware = Middleware()
  const service = {}
  const action = {
    name: 'math.add',
    bulkhead: {
      enabled: false
    },
    handler,
    service
  }

  const endpoint = {
    action,
    node: {
      id: broker.nodeID
    }
  }

  it('should register hooks', () => {
    expect(middleware.localAction).toBeDefined()
  })

  it('should not wrap handler if bulkhead is disabled', () => {
    broker.options.bulkhead.enabled = false

    const newHandler = middleware.localAction.call(broker, handler, action)
    expect(newHandler).toBe(handler)
  })

  it('should not wrap handler if bulkhead is disabled', () => {
    broker.options.bulkhead.enabled = true

    const newHandler = middleware.localAction.call(broker, handler, action)
    expect(newHandler).not.toBe(handler)
  })

  it('should call the action 2 times bevore the requests get queued', (done) => {
    broker.options.bulkhead.enabled = true
    broker.options.bulkhead.concurrentCalls = 2
    broker.options.bulkhead.maxQueueSize = 10

    contentFactory.init(broker)
    let flow = []

    const handler = jest.fn((context) => {
      flow.push('handler-' + context.data.p)
      return new Promise(resolve => {
        setTimeout(() => resolve(), 10)
      })
    })

    const contexts = [...Array(10)].map((_, i) => contentFactory.create(endpoint, { p: i }))
    const wrappedHandler = middleware.localAction.call(broker, handler, action)

    Promise.all(contexts.map(context => wrappedHandler(context)))
    expect(handler).toBeCalledTimes(2)
    expect(flow).toEqual([
      'handler-0',
      'handler-1'
    ])

    flow = []
    utils.promiseDelay(Promise.resolve(), 1000)
      .then(() => {
        expect(handler).toBeCalledTimes(10)
        expect(flow).toEqual(expect.arrayContaining([
          'handler-2',
          'handler-3',
          'handler-4',
          'handler-5',
          'handler-6',
          'handler-7',
          'handler-8',
          'handler-9'
        ]))
        done()
      })

    // expect(flow).toBe(handler)
  })

  it('should call the action 2 times immediately bevore the last requests get queued', (done) => {
    broker.options.bulkhead.enabled = true
    broker.options.bulkhead.concurrentCalls = 2
    broker.options.bulkhead.maxQueueSize = 10

    contentFactory.init(broker)
    let flow = []
    const handler = jest.fn((context) => {
      flow.push('handler-' + context.data.p)
      return new Promise(resolve => {
        setTimeout(() => resolve(), 10)
      })
    })
    const contexts = [...Array(20)].map((_, i) => contentFactory.create(endpoint, { p: i }))
    const wrappedHandler = middleware.localAction.call(broker, handler, action)

    Promise.all(contexts.map(context => wrappedHandler(context).catch(error => flow.push(error.name + '-' + context.data.p))))
    expect(handler).toBeCalledTimes(2)
    // expect(flow).toEqual([
    //     'handler-0',
    //     'handler-1'
    // ])

    flow = []
    utils.promiseDelay(Promise.resolve(), 1000)
      .then(() => {
        expect(handler).toBeCalledTimes(13)
        expect(flow).toEqual(expect.arrayContaining([
          'handler-2',
          'handler-3',
          'handler-4',
          'handler-5',
          'handler-6',
          'handler-7',
          'handler-8',
          'handler-9'
        ]))
        done()
      })

    // expect(flow).toBe(handler)
  })
})
