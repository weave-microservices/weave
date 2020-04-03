const ModelValidator = require('../lib/validator')

describe.only('Validator test', () => {
  it('should call custom validator', () => {
    const schema = {
      id: { type: 'has' }
    }
    const validationHandler = jest.fn(({ schema, messages }) => ({ code: '' }))
    const parameters = { id: new Date(), name: 'kevin ries' }
    const validator = ModelValidator()

    validator.addRule('has', validationHandler)

    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(validationHandler.mock.calls.length).toBe(1)
    expect(result).toBe(true)
  })
})
