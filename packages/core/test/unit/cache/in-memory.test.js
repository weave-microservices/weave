const { Weave } = require('../../../lib/index')
const utils = require('../../../lib/utils')

const CacheMemory = require('../../../lib/cache/memory')

const createContextFactory = require('../../../lib/broker/context.factory')

// const SlowService = require('../../services/slow.service')

describe('Test cache hash creation', () => {
    const broker = Weave()
    const contentFactory = createContextFactory()
    const handler = jest.fn(() => Promise.resolve('hooray!!!'))
    const cache = CacheMemory(broker, {})
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

    it('should wrap handler if cache settings are set', (done) => {
        const action = {
            name: 'math.add',
            cache: {
                keys: ['p']
            },
            handler,
            service
        }

        const endpoint = {
            action,
            node: {
                id: broker.nodeId
            }
        }
        const newHandler = cache.middleware(handler, action)
        contentFactory.init(broker)
        const firstContext = contentFactory.create(endpoint, { p: 1 })
        const p = newHandler(firstContext)
        p.then(result => {
            expect(result).toEqual('hooray!!!')
            const secondContext = contentFactory.create(endpoint, { p: 1 })
            newHandler(secondContext)
                .then(result => {
                    expect(result).toEqual('hooray!!!')
                    expect(secondContext.isCachedResult).toBe(true)
                    done()
                })
        })
        expect(newHandler).not.toBe(handler)
    })
})

