import * as Errors from '../../lib/errors.mts';
import { ExtendableError } from '../../lib/ExtendableError.mts';
import { restoreError } from '../../lib/utils/restoreError.mts';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('Test errors', () => {
  it('Default weave error', () => {
    const error = new Errors.WeaveError('Fatal error!', {
      code: 'DEFAULT_ERROR',
      data: { empty: 'no_data' }
    });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Fatal error!');
    assert.strictEqual(error.code, 'DEFAULT_ERROR');
    assert.deepStrictEqual(error.data, { empty: 'no_data' });
    assert.strictEqual(error.retryable, false);
  });

  it('Broker options error', () => {
    const error = new Errors.WeaveBrokerOptionsError('Fatal error!', { empty: 'no_data' });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Fatal error!');
    assert.strictEqual(error.code, 'WEAVE_BROKER_OPTIONS_ERROR');
    assert.deepStrictEqual(error.data, { empty: 'no_data' });
    assert.strictEqual(error.retryable, false);
  });

  it('Action parameter validation error', () => {
    const error = new Errors.WeaveParameterValidationError('Fatal error!', { empty: 'no_data' });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Fatal error!');
    assert.strictEqual(error.code, 'WEAVE_PARAMETER_VALIDATION_ERROR');
    assert.deepStrictEqual(error.data, { empty: 'no_data' });
    assert.strictEqual(error.retryable, false);
  });

  it('Transport queue size exceeded error', () => {
    const error = new Errors.WeaveQueueSizeExceededError({ empty: 'no_data' });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Queue size limit was exceeded. Request rejected.');
    assert.strictEqual(error.code, 'WEAVE_QUEUE_SIZE_EXCEEDED_ERROR');
    assert.deepStrictEqual(error.data, { empty: 'no_data' });
    assert.strictEqual(error.retryable, false);
  });

  it('Action request timeout error', () => {
    const error = new Errors.WeaveRequestTimeoutError('do.something', 'node1', 5000);
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Action do.something timed out node node1.');
    assert.strictEqual(error.code, 'WEAVE_REQUEST_TIMEOUT_ERROR');
    assert.deepStrictEqual(error.data, { actionName: 'do.something', nodeId: 'node1', timeout: 5000 });
    assert.strictEqual(error.retryable, true);
  });

  it('Action request timeout error', () => {
    const error = new Errors.WeaveRetryableError('Fatal error!', {
      code: 'DEFAULT_ERROR',
      data: { empty: 'no_data' }
    });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Fatal error!');
    assert.strictEqual(error.code, 'DEFAULT_ERROR');
    assert.deepStrictEqual(error.data, { empty: 'no_data' });
    assert.strictEqual(error.retryable, true);
  });

  it('Service not available error (actionName and nodeId)', () => {
    const error = new Errors.WeaveServiceNotAvailableError({ actionName: 'do.something', nodeId: 'node1' });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Service "do.something" not available on node "node1".');
    assert.strictEqual(error.code, 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR');
    assert.deepStrictEqual(error.data, { actionName: 'do.something', nodeId: 'node1' });
    assert.strictEqual(error.retryable, true);
  });

  it('Service not available error (actionName)', () => {
    const error = new Errors.WeaveServiceNotAvailableError({ actionName: 'do.something' });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Service "do.something" not available.');
    assert.strictEqual(error.code, 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR');
    assert.deepStrictEqual(error.data, { actionName: 'do.something' });
    assert.strictEqual(error.retryable, true);
  });

  it('Service not available error (default constructor param)', () => {
    const error = new Errors.WeaveServiceNotAvailableError();
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Service not available.');
    assert.strictEqual(error.code, 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR');
    assert.deepStrictEqual(error.data, {});
    assert.strictEqual(error.retryable, true);
  });

  it('Service not found error', () => {
    const error = new Errors.WeaveServiceNotFoundError({ actionName: 'do.something', nodeId: 'node1' });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Service "do.something" not found on node "node1".');
    assert.strictEqual(error.code, 'WEAVE_SERVICE_NOT_FOUND_ERROR');
    assert.deepStrictEqual(error.data, { actionName: 'do.something', nodeId: 'node1' });
    assert.strictEqual(error.retryable, true);
  });

  it('Service not found error (lokal)', () => {
    const error = new Errors.WeaveServiceNotFoundError({ actionName: 'do.something' });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Service "do.something" not found.');
    assert.strictEqual(error.code, 'WEAVE_SERVICE_NOT_FOUND_ERROR');
    assert.deepStrictEqual(error.data, { actionName: 'do.something' });
    assert.strictEqual(error.retryable, true);
  });

  it('Service not found error (no constructor)', () => {
    const error = new Errors.WeaveServiceNotFoundError();
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Service not found.');
    assert.strictEqual(error.code, 'WEAVE_SERVICE_NOT_FOUND_ERROR');
    assert.deepStrictEqual(error.data, {});
    assert.strictEqual(error.retryable, true);
  });
});

describe('Extendable error', () => {
  class TestError extends ExtendableError {}
  class SubTestError extends TestError {}

  it('shpuld be instance of', () => {
    const err = new ExtendableError();
    assert.ok(err instanceof Error);
    assert.ok(err instanceof ExtendableError);

    const err2 = new TestError();
    assert.ok(err2 instanceof Error);
    assert.ok(err2 instanceof ExtendableError);
    assert.ok(err2 instanceof TestError);

    const err3 = new SubTestError();
    assert.ok(err3 instanceof Error);
    assert.ok(err3 instanceof ExtendableError);
    assert.ok(err3 instanceof TestError);
    assert.ok(err3 instanceof SubTestError);
  });

  it('.name should behave', () => {
    const err = new ExtendableError();
    assert.strictEqual(err.name, 'ExtendableError');

    const err2 = new TestError();
    assert.strictEqual(err2.name, 'TestError');

    const err3 = new SubTestError();
    assert.strictEqual(err3.name, 'SubTestError');
  });

  it('name is not enumerable', () => {
    const err = new ExtendableError();
    assert.strictEqual(err.propertyIsEnumerable('name'), false);
  });

  it('.stack', () => {
    const err = new ExtendableError();
    assert.strictEqual(typeof err.stack, 'string');

    const err2 = new TestError();
    assert.strictEqual(typeof err2.stack, 'string');
  });

  it('#toString', () => {
    const err = new ExtendableError();
    assert.strictEqual(err.toString(), 'ExtendableError');

    const err2 = new TestError();
    assert.strictEqual(err2.toString(), 'TestError');

    const err3 = new SubTestError();
    assert.strictEqual(err3.toString(), 'SubTestError');
  });

  it('.message', () => {
    const err = new ExtendableError('error occurred');
    assert.strictEqual(err.message, 'error occurred');
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

    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, 'Error message');
    assert.strictEqual(error.code, 'ERROR_CODE');
    assert.strictEqual(error.retryable, false);
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

    assert.ok(error instanceof Errors.WeaveRetryableError);
    assert.strictEqual(error.message, 'Error message');
    assert.strictEqual(error.code, 'ERROR_CODE');
    assert.deepStrictEqual(error.data, data);
    assert.strictEqual(error.retryable, true);
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

    assert.ok(error instanceof Errors.WeaveServiceNotFoundError);
    assert.strictEqual(error.message, 'Service "test-service" not found on node "Node-1".');
    assert.strictEqual(error.code, 'WEAVE_SERVICE_NOT_FOUND_ERROR');
    assert.deepStrictEqual(error.data, data);
    assert.strictEqual(error.retryable, true);
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

    assert.ok(error instanceof Errors.WeaveServiceNotAvailableError);
    assert.strictEqual(error.message, 'Service "test-service" not available on node "Node-1".');
    assert.strictEqual(error.code, 'WEAVE_SERVICE_NOT_AVAILABLE_ERROR');
    assert.deepStrictEqual(error.data, data);
    assert.strictEqual(error.retryable, true);
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

    assert.ok(error instanceof Errors.WeaveRequestTimeoutError);
    assert.strictEqual(error.message, 'Action test-service timed out node Node-1.');
    assert.strictEqual(error.code, 'WEAVE_REQUEST_TIMEOUT_ERROR');
    assert.deepStrictEqual(error.data, data);
    assert.strictEqual(error.retryable, true);
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

    assert.ok(error instanceof Errors.WeaveParameterValidationError);
    assert.strictEqual(error.code, 'WEAVE_PARAMETER_VALIDATION_ERROR');
    assert.deepStrictEqual(error.data, data);
    assert.strictEqual(error.retryable, false);
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

    assert.ok(error instanceof Errors.WeaveBrokerOptionsError);
    assert.strictEqual(error.code, 'WEAVE_BROKER_OPTIONS_ERROR');
    assert.deepStrictEqual(error.data, data);
    assert.strictEqual(error.retryable, false);
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

    assert.ok(error instanceof Errors.WeaveQueueSizeExceededError);
    assert.strictEqual(error.code, 'WEAVE_QUEUE_SIZE_EXCEEDED_ERROR');
    assert.deepStrictEqual(error.data, data);
    assert.strictEqual(error.retryable, false);
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

    assert.ok(error instanceof Errors.WeaveMaxCallLevelError);
    assert.strictEqual(error.message, 'Request level has reached the limit 100 on node "Node-1".');
    assert.strictEqual(error.code, 'WEAVE_MAX_CALL_LEVEL_ERROR');
    assert.deepStrictEqual(error.data, data);
    assert.strictEqual(error.retryable, false);
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

    assert.ok(error instanceof Errors.WeaveGracefulStopTimeoutError);
    assert.strictEqual(error.message, 'Unable to stop service "greeter"');
    assert.strictEqual(error.code, 'WEAVE_GRACEFUL_STOP_TIMEOUT');
    assert.deepStrictEqual(error.data, data.service);
    assert.strictEqual(error.retryable, false);
  });

  it('Should restore unkown error', () => {
    const rawErrorMessage = {
      name: 'AWSRateLimitError',
      message: 'Rate limit exceeded.'
    };

    const error = restoreError(rawErrorMessage);

    assert.ok(error instanceof Error);
    assert.strictEqual(error.message, 'Rate limit exceeded.');
    assert.strictEqual(error.retryable, undefined);
  });
});
