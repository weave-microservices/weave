const { Weave } = require('../../../lib/index')
const CacheRedis = require('../../../lib/cache/redis')
// const SlowService = require('../../services/slow.service')

describe('Test IN-Memory cache initialization', () => {
    it('should create with default options.', () => {
        const broker = Weave({
            logger: {
                enabled: false
            }
        })
        const cache = CacheRedis(broker)
        expect(cache.options).toBeDefined()
        expect(cache.options.ttl).toBeNull()
    })

    it('should create with default options.', () => {
        const broker = Weave({
            logger: {
                enabled: false
            }
        })
        const cache = CacheRedis(broker)
        const expectedObject = {
            host: '127.0.0.1',
            port: 6379,
            ttl: null
        }
        expect(cache.options).toEqual(expectedObject)
        expect(cache.options.ttl).toBeNull()
    })

    it('should create with options.', () => {
        const options = { ttl: 4000 }
        const broker = Weave({
            logger: {
                enabled: false
            }
        })
        const cache = CacheRedis(broker, options)
        const expectedObject = Object.assign(options, {
            host: '127.0.0.1',
            port: 6379
        })
        expect(cache.options).toEqual(expectedObject)
        expect(cache.options.ttl).toBe(4000)
    })
})

describe('Test IN-Memory message flow', () => {
    it('should call "clear" after a new node is connected.', () => {
        const broker = Weave({
            logger: {
                enabled: false
            }
        })
        const cache = CacheRedis(broker)
        cache.init()
        cache.clear = jest.fn()
        broker.bus.emit('$transport.connected')
        expect(cache.clear).toBeCalledTimes(1)
        cache.stop()
    })
})

describe('Test usage (without TTL)', () => {
    const broker = Weave({
        logger: {
            enabled: false
        }
    })
    const cache = CacheRedis(broker)
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
        return cache.get(key1).then(res => {
            expect(res).toBeDefined()
            expect(res).toEqual(result)
            done()
        })
    })

    it('should save date with the key (2).', (done) => {
        cache.set(key1, result)
        return cache.get(key1).then(res => {
            expect(res).toBeDefined()
            expect(res).toEqual(result)
            done()
        })
    })

    it('should delete data by key.', (done) => {
        cache.remove(key1)
        return cache.get(key1).then(res => {
            expect(res).toBeDefined()
            expect(res).toBeNull()
            done()
        })
    })

    it('should clear the cache.', (done) => {
        cache.set(key1, result)
        cache.set(key2, result)

        return cache.clear()
            .then(() => cache.get(key1).then(res => {
                expect(res).toBeDefined()
                expect(res).toBeNull()
                done()
            }))
    })
})
