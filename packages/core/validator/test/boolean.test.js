const ModelValidator = require('../lib/validator')

describe('Boolean validator', () => {
  it('boolean validator (valid)', () => {
    const schema = {
      isActive: { type: 'boolean' }
    }

    const parameters = { isActive: true }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('boolean validator convert true (valid)', () => {
    const schema = {
      isActive: { type: 'boolean', convert: true }
    }

    const parameters = { isActive: 'true' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('boolean validator convert false (valid)', () => {
    const schema = {
      isActive: { type: 'boolean', convert: true }
    }

    const parameters = { isActive: 'false' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('boolean validator convert true (valid)', () => {
    const schema = {
      isActive: { type: 'boolean', convert: true }
    }

    const parameters = { isActive: 'true' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('boolean validator convert false (valid)', () => {
    const schema = {
      isActive: { type: 'boolean', convert: true }
    }

    const parameters = { isActive: 'false' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('boolean validator convert 1 (valid)', () => {
    const schema = {
      isActive: { type: 'boolean', convert: true }
    }

    const parameters = { isActive: 1 }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
    expect(parameters.isActive).toBe(true)
  })

  it('boolean validator convert 0 (valid)', () => {
    const schema = {
      isActive: { type: 'boolean', convert: true }
    }

    const parameters = { isActive: 0 }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
    expect(parameters.isActive).toBe(false)
  })

  it('boolean validator convert 1 (invalid)', () => {
    const schema = {
      isActive: { type: 'boolean', convert: true }
    }

    const parameters = { isActive: '1' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(Array.isArray(result)).toBe(true)
    expect(result[0].message).toBe('The parameter "isActive" have to be a boolean value.')
  })
})
