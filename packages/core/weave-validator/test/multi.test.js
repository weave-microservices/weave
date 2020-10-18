const ModelValidator = require('../lib/validator')

describe('Type "multi" test', () => {
  it('should throw an error if ther is passed an empty array', () => {
    const schema = {
      id: []
    }
    const validator = ModelValidator()
    const wrapCompile = () => {
      validator.compile(schema)
    }
    expect(wrapCompile).toThrowError(new Error('Invalid schema.'))
  })

  it('should call custom validator', () => {
    const validator = ModelValidator()
    const schema = {
      id: [
        { type: 'string' },
        { type: 'array' }
      ]
    }
    const validate = validator.compile(schema)

    const validParams1 = { id: ['kevin ries'] }
    const validParams2 = { id: 'kevin ries' }
    const invalidParams = { id: 222 }

    const result1 = validate(validParams1)
    const result2 = validate(validParams2)
    const result3 = validate(invalidParams)

    expect(result1).toBe(true)
    expect(result2).toBe(true)
    expect(JSON.stringify(result3)).toBe('[{\"type\":\"string\",\"message\":\"The parameter \\\"id\\\" have to be a string.\",\"field\":\"id\",\"passed\":222},{\"type\":\"array\",\"message\":\"The parameter \\\"id\\\" have to be an array.\",\"field\":\"id\"}]')
  })
})
