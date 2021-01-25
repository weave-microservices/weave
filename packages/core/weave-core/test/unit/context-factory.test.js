const { createBroker } = require('../../lib/index')
const { createContextFactory } = require('../../lib/broker/context-factory')
// const { createEndpoint } = require('../../lib/registry/endpoint')

// const fakeAction = {
//   name: 'testaction',
//   handler: () => {}
// }

describe('Test context factxory.', () => {
  it('should create an empty context.', () => {
    const broker = createBroker({ nodeId: 'Testnode' })
    const contextFactory = createContextFactory()
    contextFactory.init(broker)

    expect(contextFactory.create).toBeDefined()

    // create context
    const context = contextFactory.create(null, {})
    expect(context.broadcast).toBeDefined()
    expect(context.call).toBeDefined()
    expect(context.callerNodeId).toBeNull()
    expect(context.data).toEqual({})
    expect(context.duration).toBe(0)
    expect(context.emit).toBeDefined()
    expect(context.id).toBeDefined()
    expect(context.level).toBe(1)
    expect(context.meta).toEqual({})
    expect(context.nodeId).toBe('Testnode')
    expect(context.options).toEqual({})
    expect(context.data).toBeDefined()
    expect(context.requestId).toBeDefined()
    expect(context.requestId).toEqual(context.id)
  })

  it('should handle passed options.', () => {
    const broker = createBroker({ nodeId: 'Testnode' })
    const contextFactory = createContextFactory()
    contextFactory.init(broker)

    expect(contextFactory.create).toBeDefined()

    // create context
    const context = contextFactory.create(null, {}, { requestId: 'fancy-request' })
    expect(context.broadcast).toBeDefined()
    expect(context.call).toBeDefined()
    expect(context.callerNodeId).toBeNull()
    expect(context.data).toEqual({})
    expect(context.duration).toBe(0)
    expect(context.emit).toBeDefined()
    expect(context.id).toBeDefined()
    expect(context.level).toBe(1)
    expect(context.meta).toEqual({})
    expect(context.nodeId).toBe('Testnode')
    // expect(context.options).toBeDefined({})
    expect(context.data).toBeDefined()
    expect(context.requestId).toBe('fancy-request')
  })
})
