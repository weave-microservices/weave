const { Weave } = require('../../../lib/index')
const { createCacheBase } = require('../../../lib/cache/base')

const config = {
  logger: {
    enabled: false
  }
}

describe('Test base cache factory', () => {
  it('constructor.', () => {
    const broker = Weave(config)
    const baseCache = createCacheBase(broker)

    expect(baseCache.log).toBeDefined()
    expect(baseCache.set).toBeDefined()
    expect(baseCache.get).toBeDefined()
    expect(baseCache.remove).toBeDefined()
    expect(baseCache.clear).toBeDefined()
    expect(baseCache.options).toBeDefined()
  })

  it('Options.', () => {
    const broker = Weave(config)
    const baseCache = createCacheBase(broker)

    expect(baseCache.options.ttl).toBe(null)
  })

  it('Not implemented methods.', () => {
    const broker = Weave(config)
    const baseCache = createCacheBase(broker)

    try {
      baseCache.set('abc', 'def', 5000)
    } catch (error) {
      expect(error.message).toBe('Method not implemented.')
    }

    try {
      baseCache.get('abc', 'def', 5000)
    } catch (error) {
      expect(error.message).toBe('Method not implemented.')
    }

    try {
      baseCache.remove()
    } catch (error) {
      expect(error.message).toBe('Method not implemented.')
    }

    try {
      baseCache.clear()
    } catch (error) {
      expect(error.message).toBe('Method not implemented.')
    }
  })

  it('schould generate a caching hash.', () => {
    const broker = Weave(config)
    const baseCache = createCacheBase(broker)

    const hash = baseCache.getCachingHash('test.action', { name: 'Kevin' })
    expect(hash).toMatchSnapshot()
  })

  it('schould generate a caching hash (with 1 key)', () => {
    const broker = Weave(config)
    const baseCache = createCacheBase(broker)

    const hash = baseCache.getCachingHash('test.action', { name: 'Kevin', age: 19 }, null, ['name'])
    expect(hash).toMatchSnapshot()
  })

  it('schould generate a caching hash (with 1 key)', () => {
    const broker = Weave(config)
    const baseCache = createCacheBase(broker)

    const hash = baseCache.getCachingHash('test.action', { name: 'Kevin', age: 19, hobbies: ['coding', 'gym', 'swimming'], height: null }, null, ['name', 'age', 'hobbies', 'height'])
    expect(hash).toMatchSnapshot()
  })
})

