const { createCacheBase } = require('../../../lib/cache/adapters/base')
const { createNode } = require('../../helper')

const config = {
  logger: {
    enabled: false
  }
}

describe('Test base cache factory', () => {
  it('constructor.', () => {
    const broker = createNode(config)
    const baseCache = createCacheBase('a-name', broker)
    expect(baseCache.log).toBeDefined()
    expect(baseCache.set).toBeDefined()
    expect(baseCache.get).toBeDefined()
    expect(baseCache.remove).toBeDefined()
    expect(baseCache.clear).toBeDefined()
    expect(baseCache.options).toBeDefined()
  })

  it('Options.', () => {
    const broker = createNode(config)
    const baseCache = createCacheBase('a-name', broker)

    expect(baseCache.options.ttl).toBe(null)
  })

  it('Not implemented methods.', () => {
    const broker = createNode(config)
    const baseCache = createCacheBase('a-name', broker)

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

  it('should generate a caching hash.', () => {
    const broker = createNode(config)
    const baseCache = createCacheBase('a-name', broker)
    const hash = baseCache.getCachingKey('test.action', { name: 'Kevin' })
    expect(hash).toBe('test.action.kqVWw7bW5t57pReZ6HUGiNt2oyo=')
  })

  it('should generate a caching hash (with 1 key)', () => {
    const broker = createNode(config)
    const baseCache = createCacheBase('a-name', broker)
    const hash = baseCache.getCachingKey('test.action', { name: 'Kevin', age: 19 }, null, ['name'])
    expect(hash).toBe('test.action.M011mDHOLwLBkPUImS1jBg7XYcc=')
  })

  it('should generate a caching hash (with 1 key)', () => {
    const broker = createNode(config)
    const baseCache = createCacheBase('a-name', broker)
    const hash = baseCache.getCachingKey(
      'test.action',
      {
        name: 'Kevin',
        age: 19,
        hobbies: ['coding', 'gym', 'swimming'],
        height: null,
        weight: undefined,
        date: new Date('2022-10-10'),
        settings: {
          enabled: true,
          appearance: {
            color: 'red'
          }
        }
      },
      {
        user: {
          id: 123,
          sym: Symbol('ABC')
        }
      },
      ['date', 'name', 'age', 'hobbies', 'height', 'settings.appearance', 'weight', ':user', 'notDefined']
    )

    expect(hash).toBe('test.action.VhzGreeraZI+Q9ykNPXRiNSB/qk=')
  })
})
