const defect = require('../lib/index')

class RetryableError extends Error {
  constructor () {
    super(arguments)
    this.retryable = true
  }
}

const errors = defect({
  Validation: {},
  WeaveValidation: { code: 'WEAVE_VALIDATION' },
  ServiceNotFound: { code: 400, baseClass: RetryableError }
})

describe('Error lib', () => {
  it('should create error classes', () => {
    expect(errors.Validation).toBeDefined()
    const errorInstance = new errors.Validation()
    expect(errorInstance.name).toBe('Validation')
    expect(errorInstance.code).toBe('EVALIDATION')
  })

  it('should create error classes', () => {
    const errorInstance = new errors.WeaveValidation('Error occurred')
    expect(errorInstance.name).toBe('WeaveValidation')
    expect(errorInstance.message).toBe('Error occurred')
  })

  it('should create error with custom base class', () => {
    const errorInstance = new errors.ServiceNotFound('Service not found')
    expect(errorInstance.code).toBe(400)
    expect(errorInstance.message).toBe('Service not found')
    expect(errorInstance.retryable).toBe(true)
  })
})
