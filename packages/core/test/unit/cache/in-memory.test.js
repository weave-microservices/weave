const { Weave } = require('../../../lib/index')
const CacheMemory = require('../../../lib/cache/memory')
// const SlowService = require('../../services/slow.service')

describe('Test IN-Memory cache initialization', () => {
    it('should create with default options.', () => {
        const broker = Weave({
            logger: {
                enabled: false
            }
        })
        const cache = CacheMemory(broker)
        expect(cache.options).toBeDefined()
        expect(cache.options.ttl).toBeNull()
    })

    it('should create with options.', () => {
        const options = { ttl: 4000 }
        const broker = Weave({
            logger: {
                enabled: false
            }
        })
        const cache = CacheMemory(broker, options)
        expect(cache.options).toEqual(options)
        expect(cache.options.ttl).toBe(4000)
    })

    it('should create with options.', () => {
        const options = { ttl: 4000 }
        const broker = Weave({
            logger: {
                enabled: false
            }
        })
        const cache = CacheMemory(broker, options)
        expect(cache.options).toEqual(options)
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
        const cache = CacheMemory(broker)
        cache.init()
        cache.clear = jest.fn()
        broker.bus.emit('$transport.connected')
        expect(cache.clear).toBeCalledTimes(1)
    })
})

describe('Test usage (without TTL)', () => {
    const broker = Weave({
        logger: {
            enabled: false
        }
    })
    const cache = CacheMemory(broker)
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
    it('should save date with the key.', () => {
        cache.set(key1, result)
        return cache.get(key1).then(res => {
            expect(res).toBeDefined()
            expect(res).toEqual(result)
        })
    })

    it('should save date with the key.', () => {
        cache.set(key1, result)
        return cache.get(key1).then(res => {
            expect(res).toBeDefined()
            expect(res).toEqual(result)
        })
    })

    it('should delete data by key.', () => {
        cache.remove(key1)
        return cache.get(key1).then(res => {
            expect(res).toBeDefined()
            expect(res).toBeNull()
        })
    })

    it('should clear the cache.', () => {
        cache.set(key1, result)
        cache.set(key2, result)

        cache.clear()

        return cache.get(key1).then(res => {
            expect(res).toBeDefined()
            expect(res).toBeNull()
        })
    })
})

// describe('Test usage with TTL', () => {
//     const broker = Weave()
//     const options = { ttl: 3000 }
//     const cache = CacheMemory(broker)
//     cache.init()

//     const key1 = 'test1234:sadasda'
//     const key2 = 'test12345:sadasdasadasdasd'

//     const result = {
//         data: [
//             'Hello',
//             'my',
//             'friend'
//         ]
//     }
// })
