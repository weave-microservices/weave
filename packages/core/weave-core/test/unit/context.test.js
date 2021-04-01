const { Weave } = require('../../lib/index')
const { createContextFactory } = require('../../lib/broker/context-factory')
// const { createEndpoint } = require('../../lib/registry/endpoint')

// const fakeAction = {
//   name: 'testaction',
//   handler: () => {}
// }

describe('Test context factory.', () => {
  it('should create an empty context.', () => {
    const broker = Weave({ nodeId: 'Testnode' })
    const contextFactory = createContextFactory(broker.runtime)

    expect(contextFactory.create).toBeDefined()

    // create context
    // const context = contextFactory.create(endpoint, {})
  })
})
