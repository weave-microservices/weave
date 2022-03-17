const Errors = require('../../lib/errors')
const { ExtendableError } = require('../../lib/ExtendableError')

describe('Test errors', () => {
  it('Default weave error', () => {
    const error = new Errors.WeaveError('Fatal error!', 500, 'DEFAULT_ERROR', { empty: 'no_data' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Fatal error!')
    expect(error.code).toBe(500)
    expect(error.type).toBe('DEFAULT_ERROR')
    expect(error.data).toEqual({ empty: 'no_data' })
    expect(error.retryable).toBe(false)
  })

  it('Broker options error', () => {
    const error = new Errors.WeaveBrokerOptionsError('Fatal error!', { empty: 'no_data' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Fatal error!')
    expect(error.code).toBe(500)
    expect(error.type).toBe('WEAVE_BROKER_OPTIONS_ERROR')
    expect(error.data).toEqual({ empty: 'no_data' })
    expect(error.retryable).toBe(false)
  })

  it('Action parameter validation error', () => {
    const error = new Errors.WeaveParameterValidationError('Fatal error!', { empty: 'no_data' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Fatal error!')
    expect(error.code).toBe(422)
    expect(error.type).toBe('WEAVE_PARAMETER_VALIDATION_ERROR')
    expect(error.data).toEqual({ empty: 'no_data' })
    expect(error.retryable).toBe(false)
  })

  it('Transport queue size exceeded error', () => {
    const error = new Errors.WeaveQueueSizeExceededError({ empty: 'no_data' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Queue size limit was exceeded. Request rejected.')
    expect(error.code).toBe(429)
    expect(error.type).toBe('WEAVE_QUEUE_SIZE_EXCEEDED_ERROR')
    expect(error.data).toEqual({ empty: 'no_data' })
    expect(error.retryable).toBe(false)
  })

  it('Action request timeout error', () => {
    const error = new Errors.WeaveRequestTimeoutError('do.something', 'node1', 5000)
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Action do.something timed out node node1.')
    expect(error.code).toBe(504)
    expect(error.type).toBe('WEAVE_REQUEST_TIMEOUT_ERROR')
    expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1', timeout: 5000 })
    expect(error.retryable).toBe(true)
  })

  it('Action request timeout error', () => {
    const error = new Errors.WeaveRetryableError('Fatal error!', 500, 'DEFAULT_ERROR', { empty: 'no_data' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Fatal error!')
    expect(error.code).toBe(500)
    expect(error.type).toBe('DEFAULT_ERROR')
    expect(error.data).toEqual({ empty: 'no_data' })
    expect(error.retryable).toBe(true)
  })

  it('Service not available error (actionName and nodeId)', () => {
    const error = new Errors.WeaveServiceNotAvailableError({ actionName: 'do.something', nodeId: 'node1' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Service "do.something" not available on node "node1".')
    expect(error.code).toBe(503)
    expect(error.type).toBe('WEAVE_SERVICE_NOT_AVAILABLE_ERROR')
    expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1' })
    expect(error.retryable).toBe(true)
  })

  it('Service not available error (actionName)', () => {
    const error = new Errors.WeaveServiceNotAvailableError({ actionName: 'do.something' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Service "do.something" not available.')
    expect(error.code).toBe(503)
    expect(error.type).toBe('WEAVE_SERVICE_NOT_AVAILABLE_ERROR')
    expect(error.data).toEqual({ actionName: 'do.something' })
    expect(error.retryable).toBe(true)
  })

  it('Service not available error (default constructor param)', () => {
    const error = new Errors.WeaveServiceNotAvailableError()
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Service not available.')
    expect(error.code).toBe(503)
    expect(error.type).toBe('WEAVE_SERVICE_NOT_AVAILABLE_ERROR')
    expect(error.data).toEqual({})
    expect(error.retryable).toBe(true)
  })

  it('Service not found error', () => {
    const error = new Errors.WeaveServiceNotFoundError({ actionName: 'do.something', nodeId: 'node1' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Service "do.something" not found on node "node1".')
    expect(error.code).toBe(404)
    expect(error.type).toBe('WEAVE_SERVICE_NOT_FOUND_ERROR')
    expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1' })
    expect(error.retryable).toBe(true)
  })

  it('Service not found error (lokal)', () => {
    const error = new Errors.WeaveServiceNotFoundError({ actionName: 'do.something' })
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Service "do.something" not found.')
    expect(error.code).toBe(404)
    expect(error.type).toBe('WEAVE_SERVICE_NOT_FOUND_ERROR')
    expect(error.data).toEqual({ actionName: 'do.something' })
    expect(error.retryable).toBe(true)
  })

  it('Service not found error (no constructor)', () => {
    const error = new Errors.WeaveServiceNotFoundError()
    expect(error).toBeDefined()
    expect(error).toBeInstanceOf(Errors.WeaveError)
    expect(error.message).toBe('Service not found.')
    expect(error.code).toBe(404)
    expect(error.type).toBe('WEAVE_SERVICE_NOT_FOUND_ERROR')
    expect(error.data).toEqual({})
    expect(error.retryable).toBe(true)
  })
})

describe('Extendable error', () => {
  class TestError extends ExtendableError {}
  class SubTestError extends TestError {}

  it('shpuld be instance of', () => {
    const err = new ExtendableError()
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ExtendableError)

    const err2 = new TestError()
    expect(err2).toBeInstanceOf(Error)
    expect(err2).toBeInstanceOf(ExtendableError)
    expect(err2).toBeInstanceOf(TestError)

    const err3 = new SubTestError()
    expect(err3).toBeInstanceOf(Error)
    expect(err3).toBeInstanceOf(ExtendableError)
    expect(err3).toBeInstanceOf(TestError)
    expect(err3).toBeInstanceOf(SubTestError)
  })

  it('.name should behave', () => {
    const err = new ExtendableError()
    expect(err.name).toBe('ExtendableError')

    const err2 = new TestError()
    expect(err2.name).toBe('TestError')

    const err3 = new SubTestError()
    expect(err3.name).toBe('SubTestError')
  })

  it('name is not enumerable', () => {
    const err = new ExtendableError()
    expect(err.propertyIsEnumerable('name')).toBe(false)
  })

  it('.stack', () => {
    const err = new ExtendableError()
    expect(typeof err.stack).toBe('string')

    const err2 = new TestError()
    expect(typeof err2.stack).toBe('string')
  })

  it('#toString', () => {
    const err = new ExtendableError()
    expect(err.toString()).toBe('ExtendableError')

    const err2 = new TestError()
    expect(err2.toString()).toBe('TestError')

    const err3 = new SubTestError()
    expect(err3.toString()).toBe('SubTestError')
  })

  it('.message', () => {
    const err = new ExtendableError('error occurred')
    expect(err.message).toBe('error occurred')
  })
})
