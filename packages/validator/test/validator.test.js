const ModelValidator = require('../lib/validator')

describe('Validator test', () => {
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

describe('Validator test', () => {
  it('should throw an error if unkown validator is defined', () => {
    try {
      const schema = {
        id: { type: 'undefined!!' }
      }

      const parameters = { id: new Date(), name: 'kevin ries' }
      const validator = ModelValidator()
      const validate = validator.compile(schema)
      expect(validate).toThrow('')
      validate(parameters)
    } catch (error) {
      expect(error.message).toBe('Invalid type \'undefined!!\' in validator schema.')
    }
  })
})
