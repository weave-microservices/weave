const ModelValidator = require('../../lib/validator')

describe('Enum validator', () => {
  it('any value', () => {
    const schema = {
      type: { type: 'enum', values: ['aaa', 'bbb', 'ccc'] }
    }

    const parameters = { type: 'aaa' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('shoud validate undefined values', () => {
    const schema = {
      type: { type: 'enum' }
    }

    const parameters = { type: 'ddd' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result[0].message).toBe('The  value of the parameter "type" with the value "ddd" does not match with any of the allowed values.')
  })
})
