const createCodec = require('../../../../lib/transport/adapters/tcp/discovery/codec.js')

describe('TCP Discovery codec', () => {
  it('shout return a typed schema.', () => {
    const decoder = createCodec()

    expect(decoder.decode).toBeDefined()
    expect(decoder.encode).toBeDefined()

    const testObject = {
      name: 'Hans',
      age: 12,
      props: {
        height: 112,
        weight: 444
      }
    }

    const decoded = decoder.encode(testObject)
    const encoded = decoder.decode(decoded)
    expect(encoded).toEqual(testObject)
  })
})
