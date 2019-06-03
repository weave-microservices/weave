const CacheBase = require('../../../lib/cache/base')
const { Weave } = require('../../../lib/index')
const memory = require('../../../lib/cache/memory')
// const MathService = require('../integration/services/math.service')

describe('Test base cache factory', () => {
    it('constructor.', () => {
        const broker = Weave()
        const baseBroker = CacheBase(broker)

        expect(baseBroker.log).toBeDefined()
        expect(baseBroker.set).toBeDefined()
        expect(baseBroker.get).toBeDefined()
        expect(baseBroker.remove).toBeDefined()
        expect(baseBroker.clear).toBeDefined()
        expect(baseBroker.middleware).toBeDefined()
        expect(baseBroker.options).toBeDefined()
    })

    it('Options.', () => {
        const broker = Weave()
        const baseBroker = CacheBase(broker)

        expect(baseBroker.options.ttl).toBe(null)
    })

    it('Not implemented methods.', () => {
        const broker = Weave()
        const baseBroker = CacheBase(broker)

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
})

