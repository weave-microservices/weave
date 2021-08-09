const ModelValidator = require('../../lib/validator')

describe('Any validator', () => {
  it('any value', () => {
    const schema = {
      id: { type: 'any' },
      name: { type: 'string' }
    }

    const parameters = { id: new Date(), name: 'kevin ries' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })
})
