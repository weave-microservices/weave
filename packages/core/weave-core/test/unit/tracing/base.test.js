const BaseCollector = require('../../../lib/tracing/collectors/base')
// const { createEndpoint } = require('../../lib/registry/endpoint')

// const fakeAction = {
//   name: 'testaction',
//   handler: () => {}
// }

describe('Test base tracing colletor factory.', () => {
  it('should define default .', () => {
    const baseCollector = new BaseCollector({ })

    const flattened = baseCollector.flattenTags(null)

    expect(flattened).toBe(null)
  })

  it('should define default .', () => {
    const baseCollector = new BaseCollector({ })

    const flattened = baseCollector.flattenTags({
      nodeId: '123',
      options: {
        transport: {
          adapter: 'tcp',
          port: 4000
        }
      }
    })

    expect(flattened.nodeId).toBe('123')
    expect(flattened['options.transport.adapter']).toBe('tcp')
    expect(flattened['options.transport.port']).toBe(4000)
  })

  it('should flatten tags and convert to string .', () => {
    const baseCollector = new BaseCollector({ })

    const flattened = baseCollector.flattenTags({
      nodeId: '123',
      options: {
        transport: {
          adapter: 'tcp',
          port: 4000
        }
      }
    }, true)

    expect(flattened.nodeId).toBe('123')
    expect(flattened['options.transport.adapter']).toBe('tcp')
    expect(flattened['options.transport.port']).toBe('4000')
  })

  it('should flatten tags and convert to string .', () => {
    const baseCollector = new BaseCollector({ })

    const fields = baseCollector.getErrorFields(new Error('Something went wrong!'), 'message')

    expect(fields.message).toBe('Something went wrong!')
  })
})
