const { createBroker } = require('../../../lib/index')
const { createCacheBase } = require('../../../lib/cache/base')

const config = {
  logger: {
    enabled: false,
    logLevel: 'fatal'
  }
}

describe('Test base cache factory', () => {
  it('constructor.', () => {
    const broker = createBroker(config)
    const baseBroker = createCacheBase(broker)

    expect(baseBroker.log).toBeDefined()
    expect(baseBroker.set).toBeDefined()
    expect(baseBroker.get).toBeDefined()
    expect(baseBroker.remove).toBeDefined()
    expect(baseBroker.clear).toBeDefined()
    expect(baseBroker.createMiddleware).toBeDefined()
    expect(baseBroker.options).toBeDefined()
  })

  it('Options.', () => {
    const broker = createBroker(config)
    const baseBroker = createCacheBase(broker)

    expect(baseBroker.options.ttl).toBe(null)
  })

  it('Not implemented methods.', () => {
    const broker = createBroker(config)
    const baseBroker = createCacheBase(broker)

    try {
      baseBroker.set('abc', 'def', 5000)
    } catch (error) {
      expect(error.message).toBe('Method not implemented.')
    }

    try {
      baseBroker.get('abc', 'def', 5000)
    } catch (error) {
      expect(error.message).toBe('Method not implemented.')
    }

    try {
      baseBroker.remove()
    } catch (error) {
      expect(error.message).toBe('Method not implemented.')
    }

    try {
      baseBroker.clear()
    } catch (error) {
      expect(error.message).toBe('Method not implemented.')
    }
  })

  it('schould generate a caching hash.', () => {
    const broker = createBroker(config)
    const baseBroker = createCacheBase(broker)

    const hash = baseBroker.getCachingHash('test.action', { name: 'Kevin' })
    expect(hash).toMatchSnapshot()
  })

  it('schould generate a caching hash (with 1 key)', () => {
    const broker = createBroker(config)
    const baseBroker = createCacheBase(broker)

    const hash = baseBroker.getCachingHash('test.action', { name: 'Kevin', age: 19 }, null, ['name'])
    expect(hash).toMatchSnapshot()
  })

  it('schould generate a caching hash (with 1 key)', () => {
    const broker = createBroker(config)
    const baseBroker = createCacheBase(broker)

    const hash = baseBroker.getCachingHash('test.action', { name: 'Kevin', age: 19, hobbies: ['coding', 'gym', 'swimming'], height: null }, null, ['name', 'age', 'hobbies', 'height'])
    expect(hash).toMatchSnapshot()
  })
})

