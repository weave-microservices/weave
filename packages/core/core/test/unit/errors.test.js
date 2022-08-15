const Errors = require('../../lib/errors');
const { ExtendableError } = require('../../lib/ExtendableError');
const { restoreError } = require('../../lib/utils/restoreError');

describe('Test errors', () => {
  it('Default weave error', () => {
    const error = new Errors.WeaveError('Fatal error!', {
      statusCode: 500,
      code: 'DEFAULT_ERROR',
      data: { empty: 'no_data' }
    });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Fatal error!');
    expect(error.code).toBe('DEFAULT_ERROR');
    expect(error.data).toEqual({ empty: 'no_data' });
    expect(error.retryable).toBe(false);
  });

  it('Broker options error', () => {
    const error = new Errors.WeaveBrokerOptionsError('Fatal error!', { empty: 'no_data' });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Fatal error!');
    expect(error.code).toBe('WEAVE_BROKER_OPTIONS_ERROR');
    expect(error.data).toEqual({ empty: 'no_data' });
    expect(error.retryable).toBe(false);
  });

  it('Action parameter validation error', () => {
    const error = new Errors.WeaveParameterValidationError('Fatal error!', { empty: 'no_data' });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Fatal error!');
    expect(error.code).toBe('WEAVE_PARAMETER_VALIDATION_ERROR');
    expect(error.data).toEqual({ empty: 'no_data' });
    expect(error.retryable).toBe(false);
  });

  it('Transport queue size exceeded error', () => {
    const error = new Errors.WeaveQueueSizeExceededError({ empty: 'no_data' });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Queue size limit was exceeded. Request rejected.');
    expect(error.code).toBe('WEAVE_QUEUE_SIZE_EXCEEDED_ERROR');
    expect(error.data).toEqual({ empty: 'no_data' });
    expect(error.retryable).toBe(false);
  });

  it('Action request timeout error', () => {
    const error = new Errors.WeaveRequestTimeoutError('do.something', 'node1', 5000);
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Action do.something timed out node node1.');
    expect(error.code).toBe('WEAVE_REQUEST_TIMEOUT_ERROR');
    expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1', timeout: 5000 });
    expect(error.retryable).toBe(true);
  });

  it('Action request timeout error', () => {
    const error = new Errors.WeaveRetryableError('Fatal error!', {
      statusCode: 500,
      code: 'DEFAULT_ERROR',
      data: { empty: 'no_data' }
    });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Fatal error!');
    expect(error.code).toBe('DEFAULT_ERROR');
    expect(error.data).toEqual({ empty: 'no_data' });
    expect(error.retryable).toBe(true);
  });

  it('Service not available error (actionName and nodeId)', () => {
    const error = new Errors.WeaveServiceNotAvailableError({ actionName: 'do.something', nodeId: 'node1' });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Service "do.something" not available on node "node1".');
    expect(error.code).toBe('WEAVE_SERVICE_NOT_AVAILABLE_ERROR');
    expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1' });
    expect(error.retryable).toBe(true);
  });

  it('Service not available error (actionName)', () => {
    const error = new Errors.WeaveServiceNotAvailableError({ actionName: 'do.something' });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Service "do.something" not available.');
    expect(error.code).toBe('WEAVE_SERVICE_NOT_AVAILABLE_ERROR');
    expect(error.data).toEqual({ actionName: 'do.something' });
    expect(error.retryable).toBe(true);
  });

  it('Service not available error (default constructor param)', () => {
    const error = new Errors.WeaveServiceNotAvailableError();
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Service not available.');
    expect(error.code).toBe('WEAVE_SERVICE_NOT_AVAILABLE_ERROR');
    expect(error.data).toEqual({});
    expect(error.retryable).toBe(true);
  });

  it('Service not found error', () => {
    const error = new Errors.WeaveServiceNotFoundError({ actionName: 'do.something', nodeId: 'node1' });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Service "do.something" not found on node "node1".');
    expect(error.code).toBe('WEAVE_SERVICE_NOT_FOUND_ERROR');
    expect(error.data).toEqual({ actionName: 'do.something', nodeId: 'node1' });
    expect(error.retryable).toBe(true);
  });

  it('Service not found error (lokal)', () => {
    const error = new Errors.WeaveServiceNotFoundError({ actionName: 'do.something' });
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Service "do.something" not found.');
    expect(error.code).toBe('WEAVE_SERVICE_NOT_FOUND_ERROR');
    expect(error.data).toEqual({ actionName: 'do.something' });
    expect(error.retryable).toBe(true);
  });

  it('Service not found error (no constructor)', () => {
    const error = new Errors.WeaveServiceNotFoundError();
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Service not found.');
    expect(error.code).toBe('WEAVE_SERVICE_NOT_FOUND_ERROR');
    expect(error.data).toEqual({});
    expect(error.retryable).toBe(true);
  });
});

describe('Extendable error', () => {
  class TestError extends ExtendableError {}
  class SubTestError extends TestError {}

  it('shpuld be instance of', () => {
    const err = new ExtendableError();
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ExtendableError);

    const err2 = new TestError();
    expect(err2).toBeInstanceOf(Error);
    expect(err2).toBeInstanceOf(ExtendableError);
    expect(err2).toBeInstanceOf(TestError);

    const err3 = new SubTestError();
    expect(err3).toBeInstanceOf(Error);
    expect(err3).toBeInstanceOf(ExtendableError);
    expect(err3).toBeInstanceOf(TestError);
    expect(err3).toBeInstanceOf(SubTestError);
  });

  it('.name should behave', () => {
    const err = new ExtendableError();
    expect(err.name).toBe('ExtendableError');

    const err2 = new TestError();
    expect(err2.name).toBe('TestError');

    const err3 = new SubTestError();
    expect(err3.name).toBe('SubTestError');
  });

  it('name is not enumerable', () => {
    const err = new ExtendableError();
    expect(err.propertyIsEnumerable('name')).toBe(false);
  });

  it('.stack', () => {
    const err = new ExtendableError();
    expect(typeof err.stack).toBe('string');

    const err2 = new TestError();
    expect(typeof err2.stack).toBe('string');
  });

  it('#toString', () => {
    const err = new ExtendableError();
    expect(err.toString()).toBe('ExtendableError');

    const err2 = new TestError();
    expect(err2.toString()).toBe('TestError');

    const err3 = new SubTestError();
    expect(err3.toString()).toBe('SubTestError');
  });

  it('.message', () => {
    const err = new ExtendableError('error occurred');
    expect(err.message).toBe('error occurred');
  });
});

describe('Error restoring', () => {
  it('Should restore WeaveError', () => {
    const rawErrorMessage = {
      name: 'WeaveError',
      message: 'Error message',
      code: 'ERROR_CODE'
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveError);
    expect(error.message).toBe('Error message');
    expect(error.code).toBe('ERROR_CODE');
    expect(error.retryable).toBe(false);
  });

  it('Should restore WeaveRetryableError', () => {
    const data = {
      service: 'test-service',
      version: 1
    };

    const rawErrorMessage = {
      name: 'WeaveRetryableError',
      message: 'Error message',
      data,
      code: 'ERROR_CODE'
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveRetryableError);
    expect(error.message).toBe('Error message');
    expect(error.code).toBe('ERROR_CODE');
    expect(error.data).toEqual(data);
    expect(error.retryable).toBe(true);
  });

  it('Should restore WeaveServiceNotFoundError', () => {
    const data = {
      actionName: 'test-service',
      nodeId: 'Node-1'
    };

    const rawErrorMessage = {
      name: 'WeaveServiceNotFoundError',
      data
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveServiceNotFoundError);
    expect(error.message).toBe('Service \"test-service\" not found on node \"Node-1\".');
    expect(error.code).toBe('WEAVE_SERVICE_NOT_FOUND_ERROR');
    expect(error.data).toEqual(data);
    expect(error.retryable).toBe(true);
  });

  it('Should restore WeaveServiceNotAvailableError', () => {
    const data = {
      actionName: 'test-service',
      nodeId: 'Node-1'
    };

    const rawErrorMessage = {
      name: 'WeaveServiceNotAvailableError',
      data
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveServiceNotAvailableError);
    expect(error.message).toBe('Service \"test-service\" not available on node \"Node-1\".');
    expect(error.code).toBe('WEAVE_SERVICE_NOT_AVAILABLE_ERROR');
    expect(error.data).toEqual(data);
    expect(error.retryable).toBe(true);
  });

  it('Should restore WeaveRequestTimeoutError', () => {
    const data = {
      actionName: 'test-service',
      nodeId: 'Node-1',
      timeout: 3000
    };

    const rawErrorMessage = {
      name: 'WeaveRequestTimeoutError',
      data
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveRequestTimeoutError);
    expect(error.message).toBe('Action test-service timed out node Node-1.');
    expect(error.code).toBe('WEAVE_REQUEST_TIMEOUT_ERROR');
    expect(error.data).toEqual(data);
    expect(error.retryable).toBe(true);
  });

  it('Should restore WeaveParameterValidationError', () => {
    const data = {
      actionName: 'test-service',
      nodeId: 'Node-1',
      timeout: 3000
    };

    const rawErrorMessage = {
      name: 'WeaveParameterValidationError',
      data
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveParameterValidationError);
    expect(error.code).toBe('WEAVE_PARAMETER_VALIDATION_ERROR');
    expect(error.data).toEqual(data);
    expect(error.retryable).toBe(false);
  });

  it('Should restore WeaveBrokerOptionsError', () => {
    const data = {
      actionName: 'test-service',
      nodeId: 'Node-1',
      timeout: 3000
    };

    const rawErrorMessage = {
      name: 'WeaveBrokerOptionsError',
      data
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveBrokerOptionsError);
    expect(error.code).toBe('WEAVE_BROKER_OPTIONS_ERROR');
    expect(error.data).toEqual(data);
    expect(error.retryable).toBe(false);
  });

  it('Should restore WeaveQueueSizeExceededError', () => {
    const data = {
      actionName: 'test-service',
      nodeId: 'Node-1',
      timeout: 3000
    };

    const rawErrorMessage = {
      name: 'WeaveQueueSizeExceededError',
      data
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveQueueSizeExceededError);
    expect(error.code).toBe('WEAVE_QUEUE_SIZE_EXCEEDED_ERROR');
    expect(error.data).toEqual(data);
    expect(error.retryable).toBe(false);
  });

  it('Should restore WeaveMaxCallLevelError', () => {
    const data = {
      maxCallLevel: 100,
      nodeId: 'Node-1'
    };

    const rawErrorMessage = {
      name: 'WeaveMaxCallLevelError',
      data
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveMaxCallLevelError);
    expect(error.message).toBe('Request level has reached the limit 100 on node \"Node-1\".');
    expect(error.code).toBe('WEAVE_MAX_CALL_LEVEL_ERROR');
    expect(error.data).toEqual(data);
    expect(error.retryable).toBe(false);
  });

  it('Should restore WeaveGracefulStopTimeoutError', () => {
    const data = {
      service: {
        name: 'greeter',
        version: 1
      }
    };

    const rawErrorMessage = {
      name: 'WeaveGracefulStopTimeoutError',
      data
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Errors.WeaveGracefulStopTimeoutError);
    expect(error.message).toBe('Unable to stop service \"greeter\"');
    expect(error.code).toBe('WEAVE_GRACEFUL_STOP_TIMEOUT');
    expect(error.data).toEqual(data.service);
    expect(error.retryable).toBe(false);
  });

  it('Should restore unkown error', () => {
    const rawErrorMessage = {
      name: 'AWSRateLimitError',
      message: 'Rate limit exceeded.'
    };

    const error = restoreError(rawErrorMessage);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Rate limit exceeded.');
    expect(error.retryable).toBeUndefined();
  });
});
