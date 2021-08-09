const { Weave } = require('../../../lib/index')
const { createCacheBase } = require('../../../lib/cache/base')

// const SlowService = require('../../services/slow.service')

describe('Test cache hash creation', () => {
  const broker = Weave({
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
  const broker = Weave({
    logger: {
      enabled: false
    }
  })
  const handler = jest.fn(() => Promise.resolve('hooray!!!'))
  const cacheBase = createCacheBase(broker, {})
  const service = {}

  it('should be defined', () => {
    const action = {
      name: 'math.add',
      handler,
      service
    }
    const middleware = cacheBase.middleware(handler, action)
    expect(middleware).toBeDefined()
  })

  it('should not wrap handler if cache settings are not set', () => {
    const action = {
      name: 'math.add',
      handler,
      service
    }
    const newHandler = cacheBase.middleware().localAction(handler, action)
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
    const newHandler = cacheBase.middleware(handler, action)
    expect(newHandler).not.toBe(handler)
  })
})
