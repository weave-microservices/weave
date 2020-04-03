const ModelValidator = require('../lib/validator')

describe.only('Object validator', () => {
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

  // it.only('should escape eval ', () => {
  //     const schema = {
  //         user: { type: 'object', props: {
  //             'firstname': { type: 'string' },
  //             'lastname': { type: 'string' }
  //         }}
  //     }

  //     const parameters = { user: {
  //         firstname: 'Kevin',
  //         lastname: 'Ries'
  //     }}

  //     const validator = ModelValidator()
  //     const validate = validator.compile(schema)
  //     const result = validate(parameters)

  //     expect(result).toBe(true)
  // })
})
