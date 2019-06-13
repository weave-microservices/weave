const { Weave } = require('../../../lib/index')
const utils = require('../../../lib/utils')

const CacheBase = require('../../../lib/cache/base')

const createContextFactory = require('../../../lib/broker/context.factory')

// const SlowService = require('../../services/slow.service')

describe('Test cache hash creation', () => {
    const broker = Weave()
    const contentFactory = createContextFactory()
    const handler = jest.fn(() => Promise.resolve('hooray!!!'))
    const cacheBase = CacheBase(broker, {})
    const service = {}
    const action = {
        name: 'math.add',
        cache: {
            enabled: false
        },
        handler,
        service
    }

    const endpoint = {
        action,
        node: {
            id: broker.nodeID
        }
    }

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
    const broker = Weave()
    const contentFactory = createContextFactory()
    const handler = jest.fn(() => Promise.resolve('hooray!!!'))
    const cacheBase = CacheBase(broker, {})
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
        const newHandler = cacheBase.middleware(handler, action)
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

    // it('should wrap handler if cache settings are set', (done) => {
    //     const action = {
    //         name: 'math.add',
    //         cache: {
    //             keys: ['p']
    //         },
    //         handler,
    //         service
    //     }

    //     const endpoint = {
    //         action,
    //         node: {
    //             id: broker.nodeId
    //         }
    //     }
    //     const newHandler = cacheBase.middleware(handler, action)
    //     contentFactory.init(broker)
    //     const firstContext = contentFactory.create(endpoint, { p: 1 })
    //     const p = newHandler(firstContext)
    //     p.then(result => {
    //         expect(result).toEqual('hooray!!!')
    //         const secondContext = contentFactory.create(endpoint, { p: 1 })
    //         newHandler(secondContext)
    //             .then(result => {
    //                 secondContext
    //             })
    //     })
    //     expect(newHandler).not.toBe(handler)
    // })
})

