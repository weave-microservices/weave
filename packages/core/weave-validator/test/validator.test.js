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

  it('should validate', () => {
    const schema = {
      name: { type: 'string' }
    }

    const parameters = { name: '12345' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const res = validate(parameters)
    expect(res).toBe(true)
  })

  it('should define a default value', () => {
    const defaultValue = 'Ulf'
    const schema = {
      name: { type: 'string', default: defaultValue }
    }

    const parameters = {}
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const res = validate(parameters)
    expect(parameters.name).toBe(defaultValue)
    expect(res).toBe(true)
  })

  it('should define a default value', () => {
    const defaultValue = 'Ulf'
    const schema = {
      name: { type: 'string', default: defaultValue }
    }

    const parameters = {}
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const res = validate(parameters)
    expect(parameters.name).toBe(defaultValue)
    expect(res).toBe(true)
  })

  it('should throw an error if the property type is missing.', () => {
    try {
      const schema = {
        name: { s: 'string' }
      }

      const validator = ModelValidator()
      validator.compile(schema)
    } catch (error) {
      expect(error.message).toBe('Property type is missing.')
    }
  })
})

describe('Root property validation', () => {
  it('should validate root string value', () => {
    const schema = { type: 'string' }

    const parameters = 'kevin'
    const validator = ModelValidator()
    const validate = validator.compile(schema, { root: true })
    const res = validate(parameters)
    expect(res).toBe(true)
  })

  it('should validate root string value', () => {
    const schema = { type: 'number' }

    const parameters = 5
    const validator = ModelValidator()
    const validate = validator.compile(schema, { root: true })
    const res = validate(parameters)
    expect(res).toBe(true)
  })
})
