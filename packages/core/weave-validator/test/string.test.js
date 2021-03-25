const ModelValidator = require('../lib/validator')

describe('String validator', () => {
  it('should validate shortcut definition', () => {
    const schema = {
      type: 'string'
    }

    const parameters = { type: 'aaa' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('should validate', () => {
    const schema = {
      type: { type: 'string' }
    }

    const parameters = { type: 'aaa' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('should pass if equal', () => {
    const schema = {
      type: { type: 'string', equal: 'aaa' }
    }

    const parameters = { type: 'aaa' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('should fail if not equal', () => {
    const schema = {
      type: { type: 'string', equal: 'abc' }
    }

    const parameters = { type: 'aaa' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result[0].message).toBe('The parameter "type" must not be equal to abc.')
  })

  it('should fail if string is to short', () => {
    const schema = {
      name: { type: 'string', minLength: 10 }
    }

    const parameters = { name: 'aaa' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result[0].message).toBe('The parameter "name" must be at least 10 characters long.')
  })

  it('should pass if string is long enough', () => {
    const schema = {
      name: { type: 'string', minLength: 10 }
    }

    const parameters = { name: 'aaaaaaaaaa' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('should pass if string is to long', () => {
    const schema = {
      name: { type: 'string', maxLength: 5 }
    }

    const parameters = { name: 'aaaaaa' } // 6
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result[0].message).toBe('The parameter "name" must be less than or equal to 5 characters long.')
  })

  it('should pass if string is to long', () => {
    const schema = {
      name: { type: 'string', base64: true }
    }

    const parameters = { name: 'aaaaaa' } // 6
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result[0].message).toBe('The parameter "name" must be less than or equal to 5 characters long.')
  })
})
