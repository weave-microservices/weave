const ModelValidator = require('../../lib/validator')

describe('Email validator', () => {
  it('email validator (valid)', () => {
    const schema = {
      email: { type: 'email' }
    }

    const parameters = { email: 'hello@weave-js.com' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
    expect(parameters.email).toBe('hello@weave-js.com')
  })

  it('email validator - invalid, not an email', () => {
    const schema = {
      email: { type: 'email' }
    }

    const parameters = { email: '@weave-js.com' }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result[0].message).toBe('The value of parameter "email" is not a valid email address.')
  })

  it('email validator - invalid, not a string', () => {
    const schema = {
      email: { type: 'email' }
    }

    const parameters = { email: new Date() }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result[0].message).toBe('The parameter "email" have to be a string.')
  })

  it('shöuld use precise mode', () => {
    const schema = {
      email: { type: 'email', mode: 'precise' }
    }

    const parameters = { email: new Date() }
    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result[0].message).toBe('The parameter "email" have to be a string.')
  })
})
