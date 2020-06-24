const ModelValidator = require('../lib/validator')

describe('Object validator', () => {
  it('should pass with object', () => {
    const schema = {
      user: {
        type: 'object', props: {
          firstname: { type: 'string' },
          lastname: { type: 'string' }
        }
      }
    }

    const parameters = { user: {
      firstname: 'Kevin',
      lastname: 'Ries'
    }}

    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('should validate a simple object', () => {
    const schema = {
      user: { type: 'object' }
    }

    const parameters = { user: {
      firstname: 'Kevin',
      lastname: 'Ries'
    }}

    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })

  it('should escape js string', () => {
    const schema = {
      user: { type: 'object', props: {
        'first-name': { type: 'string' },
        lastname: { type: 'string' }
      }}
    }

    const parameters = { user: {
      'first-name': 'Kevin',
      lastname: 'Ries'
    }}

    const validator = ModelValidator()
    const validate = validator.compile(schema)
    const result = validate(parameters)

    expect(result).toBe(true)
  })
})
