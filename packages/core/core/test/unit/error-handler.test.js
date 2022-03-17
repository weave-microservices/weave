const Errors = require('../../lib/errors')
const { fatalErrorHandler } = require('../../lib/errorHandler')

describe('Test error handler', () => {
  const realProcessExit = process.exit
  process.exit = jest.fn(() => {
    throw Error()
  })
  afterAll(() => { process.exit = realProcessExit })
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
})
