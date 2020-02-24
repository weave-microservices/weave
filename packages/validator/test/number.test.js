const ModelValidator = require('../lib/validator')

describe.only('Model validator', () => {
    it('number validator (invalid)', () => {
        const schema = {
            id: { type: 'number' },
            name: { type: 'string' }
        }

        const parameters = { id: '1234', name: 'kevin ries' }
        const validator = ModelValidator()
        const validate = validator.compile(schema)
        const result = validate(parameters)

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(1)
        expect(result[0].message).toBe('The parameter "id" have to be a number.')
    })

    it('number validator (valid)', () => {
        const schema = {
            id: { type: 'number' },
            name: { type: 'string' }
        }

        const parameters = { id: 1234, name: 'kevin ries' }
        const validator = ModelValidator()
        const validate = validator.compile(schema)
        const result = validate(parameters)

        expect(result).toBe(true)
    })

    it('number validator min', () => {
        const schema = {
            id: { type: 'number', min: 1300 },
            name: { type: 'string' }
        }

        const parameters = { id: 1234, name: 'kevin ries' }
        const validator = ModelValidator()
        const validate = validator.compile(schema)
        const result = validate(parameters)

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(1)
        expect(result[0].message).toBe('The value of parameter "id" must be at least 1300.')

    })

    it('number validator max', () => {
        const schema = {
            id: { type: 'number', max: 1000 },
            name: { type: 'string' }
        }

        const parameters = { id: 1234, name: 'kevin ries' }
        const validator = ModelValidator()
        const validate = validator.compile(schema)
        const result = validate(parameters)

        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(1)
        expect(result[0].message).toBe('The value of parameter "id" must not exceed 1000.')    })

})
