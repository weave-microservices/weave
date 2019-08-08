const cache = require('../../../lib/cache/index')
const { WeaveBrokerOptionsError } = require('../../../lib/errors')
// const SlowService = require('../../services/slow.service')

describe('Test Cache resolver', () => {
    it('should create with default options.', () => {
        expect(cache.resolve).toBeDefined()
        expect(cache.adapters).toBeDefined()
    })

    it('should resolve in memory cache (1).', () => {
        const inMemoryCache = cache.resolve(true)
        expect(inMemoryCache).toBeDefined()
    })

    it('should resolve in memory cache (2).', () => {
        const inMemoryCache = cache.resolve('memory')
        expect(inMemoryCache).toBeDefined()
    })

    it('should resolve REDIS cache.', () => {
        const inMemoryCache = cache.resolve('redis')
        expect(inMemoryCache).toBeDefined()
    })

    it('should resolve custom cache module.', () => {
        const customCache = () => {}
        const newMemory = cache.resolve(customCache)
        expect(newMemory).toEqual(customCache)
    })

    it('should throw an error on empty type name.', () => {
        try {
            cache.resolve('')
        } catch (error) {
            expect(error).toEqual(new WeaveBrokerOptionsError('Unknown cache type ""'))
        }
    })

    it('should throw an error on unknown type.', () => {
        try {
            cache.resolve('unknown')
        } catch (error) {
            expect(error).toEqual(new WeaveBrokerOptionsError('Unknown cache type "unknown"'))
        }
    })
})
