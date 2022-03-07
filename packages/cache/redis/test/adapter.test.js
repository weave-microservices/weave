const { Weave } = require('@weave-js/core')
const { createRedisCache } = require('../lib/index.js')
// const SlowService = require('../../services/slow.service')

describe('Test IN-Memory cache initialization', () => {
  it('should create with default options.', () => {
    const broker = Weave({
      logger: {
        enabled: false
      }
    })

    const cache = createRedisCache()(broker.runtime)
    expect(cache.options).toBeDefined()
    expect(cache.options.ttl).toBeNull()
  })

  it('should create with default options.', () => {
    const broker = Weave({
      logger: {
        enabled: false
      }
    })
    const cache = createRedisCache()(broker.runtime)
    const expectedObject = {
      host: '127.0.0.1',
      port: 6379
    }
    expect(cache.adapterOptions).toEqual(expectedObject)
    expect(cache.options.ttl).toBeNull()
  })

  it('should create with options.', () => {
    const cacheOptions = { ttl: 4000 }
    const broker = Weave({
      logger: {
        enabled: false
      }
    })
    const cache = createRedisCache()(broker.runtime, cacheOptions)
    const expectedObject = {
      host: '127.0.0.1',
      port: 6379
    }
    expect(cache.adapterOptions).toEqual(expectedObject)
    expect(cache.options.ttl).toBe(4000)
  })
})

describe('Test message flow', () => {
  it('should call "clear" after a new node is connected.', () => {
    const broker = Weave({
      logger: {
        enabled: false
      }
    })
    const cache = createRedisCache()(broker)
    cache.init()
    cache.clear = jest.fn()
    broker.bus.emit('$transport.connected')
    expect(cache.clear).toBeCalledTimes(1)
    cache.stop()
    broker.stop()
  })
})

describe('Test usage (without TTL)', () => {
  const broker = Weave({
    logger: {
      enabled: false
    }
  })
  const cache = createRedisCache()(broker)
  cache.init()

  const key1 = 'test1234:sadasda'
  const key2 = 'test12345:sadasdasadasdasd'

  const result = {
    data: [
      'Hello',
      'my',
      'friend'
    ]
  }

  afterAll(() => {
    cache.stop()
  })

  it('should save date with the key (1).', (done) => {
    cache.set(key1, result)
    cache.get(key1).then(res => {
      expect(res).toBeDefined()
      expect(res).toEqual(result)
      done()
    }).catch(error => {
      done.fail(error)
    })
  })

  it('should save date with the key (2).', (done) => {
    cache.set(key1, result)
    cache.get(key1).then(res => {
      expect(res).toBeDefined()
      expect(res).toEqual(result)
      done()
    }).catch(error => {
      done.fail(error)
    })
  })

  it('should delete data by key.', (done) => {
    cache.remove(key1)
    cache.get(key1).then(res => {
      expect(res).toBeDefined()
      expect(res).toBeNull()
      done()
    }).catch(error => {
      done.fail(error)
    })
  })

  it('should clear the cache.', (done) => {
    cache.set(key1, result)
    cache.set(key2, result)

    cache.clear()
      .then(() => cache.get(key1).then(res => {
        expect(res).toBeDefined()
        expect(res).toBeNull()
        done()
      })).catch(error => {
        done.fail(error)
      })
  })
})
