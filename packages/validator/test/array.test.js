const ModelValidator = require('../lib/validator')

describe('Array type', () => {
    it('array validator', () => {
        
        const schema = {
            id: { type: 'number', convert: true },
            name: { type: 'string' },
            coords: { type: 'array', contains: { type: 'string' }}
        }

        const validator = ModelValidator()

        const validate = validator.compile(schema)
        const model = { id: '1234', name: 'kevin ries', coords: ['test1', 'test2'] }
        const result = validate(model)
        expect(result).toBe(true)
    })

    it('array validator with custom type', () => {
        const schema = {
            id: { type: 'number', convert: true },
            name: { type: 'string' },
            coords: { type: 'array' }
        }
        const validator = ModelValidator()

        const validate = validator.compile(schema)
        const model = { id: '1234', name: 'kevin ries', coords: [1, 2] }
        const result = validate(model)
        expect(result).toBe(true)
    })
})
