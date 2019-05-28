const Error = require('../../lib/errors')

describe('Test errors', () => {
    it('Default weave error', () => {
        const error = new Error.WeaveError('Fatal error!', 500, 'DEFAULT_ERROR', { empty: 'no_data' })
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(Error.WeaveError)
        expect(error.message).toBe('Fatal error!')
        expect(error.code).toBe(500)
        expect(error.type).toBe('DEFAULT_ERROR')
        expect(error.data).toEqual({ empty: 'no_data' })
        expect(error.retryable).toBe(false)
    })

    it('Broker options error', () => {
        const error = new Error.WeaveBrokerOptionsError('Fatal error!', { empty: 'no_data' })
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(Error.WeaveError)
        expect(error.message).toBe('Fatal error!')
        expect(error.code).toBe(500)
        expect(error.type).toBe('WEAVE_BROKER_OPTIONS_ERROR')
        expect(error.data).toEqual({ empty: 'no_data' })
        expect(error.retryable).toBe(false)
    })

    it('Action parameter validation error', () => {
        const error = new Error.WeaveParameterValidationError('Fatal error!', { empty: 'no_data' })
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(Error.WeaveError)
        expect(error.message).toBe('Fatal error!')
        expect(error.code).toBe(422)
        expect(error.type).toBe('WEAVE_PARAMETER_VALIDATION_ERROR')
        expect(error.data).toEqual({ empty: 'no_data' })
        expect(error.retryable).toBe(false)
    })

    it('Transport queue size exceeded error', () => {
        const error = new Error.WeaveQueueSizeExceededError({ empty: 'no_data' })
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(Error.WeaveError)
        expect(error.message).toBe('Queue size limit was exceeded. Request rejected.')
        expect(error.code).toBe(429)
        expect(error.type).toBe('WEAVE_QUEUE_SIZE_EXCEEDED_ERROR')
        expect(error.data).toEqual({ empty: 'no_data' })
        expect(error.retryable).toBe(false)
    })

    it('Action request timeout error', () => {
        const error = new Error.WeaveRequestTimeoutError('do.something', 'node1', 5000)
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(Error.WeaveError)
        expect(error.message).toBe('Action do.something timed out node node1.')
        expect(error.code).toBe(504)
        expect(error.type).toBe('WEAVE_REQUEST_TIMEOUT_ERROR')
        expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1' })
        expect(error.retryable).toBe(true)
    })

    it('Action request timeout error', () => {
        const error = new Error.WeaveRetrieableError('Fatal error!', 500, 'DEFAULT_ERROR', { empty: 'no_data' })
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(Error.WeaveError)
        expect(error.message).toBe('Fatal error!')
        expect(error.code).toBe(500)
        expect(error.type).toBe('DEFAULT_ERROR')
        expect(error.data).toEqual({ empty: 'no_data' })
        expect(error.retryable).toBe(true)
    })

    it('Service not available error', () => {
        const error = new Error.WeaveServiceNotAvailableError('do.something', 'node1')
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(Error.WeaveError)
        expect(error.message).toBe('Service do.something not available on node node1')
        expect(error.code).toBe(405)
        expect(error.type).toBe('WEAVE_SERVICE_NOT_AVAILABLE_ERROR')
        expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1' })
        expect(error.retryable).toBe(true)
    })

    it('Service not available error', () => {
        const error = new Error.WeaveServiceNotFoundError('do.something', 'node1')
        expect(error).toBeDefined()
        expect(error).toBeInstanceOf(Error.WeaveError)
        expect(error.message).toBe('Service do.something not found on node node1')
        expect(error.code).toBe(404)
        expect(error.type).toBe('WEAVE_SERVICE_NOT_FOUND_ERROR')
        expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1' })
        expect(error.retryable).toBe(true)
    })
})

