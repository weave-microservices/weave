const { createCacheBase } = require('../../../lib/cache/base')
const cacheMiddleware = require('../../../lib/middlewares/cache')
const { createFakeRuntime } = require('../../helper/runtime')
const { createNode } = require('../../helper')

// const SlowService = require('../../services/slow.service')

describe('Test cache hash creation', () => {
  const broker = createNode({
    logger: {
      enabled: false
    }
  })
  const cacheBase = createCacheBase(broker, {})

  it('should return the action name if no parameter was passed,', () => {
    const hash = cacheBase.getCachingHash('testAction')
    expect(hash).toEqual('testAction')
  })

  it('should return the hashed value for the request.', () => {
    const hash = cacheBase.getCachingHash('testAction', { a: 3, b: 2, c: '3' })
    expect(hash).not.toEqual('testAction')
    expect(hash.length).toBeGreaterThan(10)
  })
})

describe('Test cache middleware', () => {
  const handler = jest.fn(() => Promise.resolve('hooray!!!'))
  const service = {}

  it('should be defined', () => {
    const action = {
      name: 'math.add',
      handler,
      service
    }
    const middleware = cacheMiddleware(handler, action)
    expect(middleware).toBeDefined()
  })

  it('should not wrap handler if cache settings are not set', () => {
    const action = {
      name: 'math.add',
      handler,
      service
    }
    const runtime = createFakeRuntime()

    const newHandler = cacheMiddleware(runtime).localAction(handler, action)
    expect(newHandler).toBe(handler)
  })

  it('should wrap handler if cache settings are set', () => {
    const action = {
      name: 'math.add',
      cache: {
        keys: ['p']
      },
      handler,
      service
    }
    const newHandler = cacheMiddleware(handler, action)
    expect(newHandler).not.toBe(handler)
  })
})
