const Serializers = require('../../../lib/serializers')

describe.only('JSon serializer generation', () => {
    let serializer

    beforeEach(() => {
        serializer = Serializers.json()
    })

    it('Should throw an error, if the service schema is missing.', () => {
        const result = serializer.serialize({
            test: 'hello'
        })

        const original = serializer.deserialize(result)
        expect(original).toHaveProperty('test', 'hello')
    })
})
