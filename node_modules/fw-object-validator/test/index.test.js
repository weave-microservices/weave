const assert = require('assertthat')
const ModelValidator = require('../src/model-validator')
const ModelTransform = require('../src/model-transform')

describe('Model validator', () => {
    it('number validator', () => {
        const schema = {
            id: { type: 'number', convert: true },
            name: { type: 'string' }
        }
        const validator = ModelValidator()
        validator.addRule('ObjectID', function (obj, schema) {
            return true
        })
        const validate = validator.compile(schema)
        const result = validate({ id: '1234', name: 'kevin ries' })
        assert.that(result).is.equalTo(true)
    })

    it('array validator', () => {
        const schema = {
            id: { type: 'number', convert: true },
            name: { type: 'string' },
            coords: { type: 'array', contains: { type: 'string' }, maxLength: 2 }
        }
        const validator = ModelValidator()
        validator.addRule('ObjectID', function (obj, schema) {
            return true
        })
        const validate = validator.compile(schema)
        const model = { id: '1234', name: 'kevin ries', coords: ['test1', 'test2'] }
        const result = validate(model)
        assert.that(result).is.equalTo(true)
    })

    it('array validator with custom type', () => {
        const schema = {
            id: { type: 'number', convert: true },
            name: { type: 'string' },
            coords: { type: 'array', contains: { type: 'double' } }
        }
        const validator = ModelValidator()
        const transformer = ModelTransform(schema)
        transformer.addRule('double', function (obj, schema) {
            obj = obj + 10
            return true
        })
        const validate = validator.compile(schema)
        const model = { id: '1234', name: 'kevin ries', coords: [1, 2] }
        const result = validate(model)
        assert.that(result).is.equalTo(true)
    })
})
