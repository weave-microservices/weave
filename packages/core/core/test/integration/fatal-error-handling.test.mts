import { createNode } from '../helper/index.mts';
import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';

describe('Fatal Error Handling', () => {
  let broker;
  let exitMock;
  let originalSetTimeout;

  beforeEach(() => {
    exitMock = mock.method(process, 'exit', (code) => code);
    originalSetTimeout = global.setTimeout;
  });

  afterEach(async () => {
    exitMock.mock.restore();
    global.setTimeout = originalSetTimeout;
    if (broker && broker.runtime && broker.runtime.state && broker.runtime.state.isStarted) {
      // Restore any mocked stop method before cleanup
      if (broker.stop.mock) {
        broker.stop.mock.restore();
      }
      await broker.stop().catch(() => {});
    }
  }, 15000);

  describe('Graceful shutdown on fatal errors', () => {
    it('should attempt graceful shutdown when broker is started', async () => {
      broker = createNode({
        nodeId: 'graceful-shutdown-test',
        logger: { enabled: false }
      });

      const stopSpy = mock.method(broker, 'stop', () => Promise.resolve());

      await broker.start();

      broker.fatalError('Test fatal error', new Error('Fatal test error'));

      // Wait for async shutdown process
      await new Promise(resolve => setTimeout(resolve, 100));

      assert.strictEqual(stopSpy.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });

    it('should exit immediately when broker is not started', () => {
      broker = createNode({
        nodeId: 'immediate-exit-test',
        logger: { enabled: false }
      });

      const stopSpy = mock.method(broker, 'stop', () => Promise.resolve());

      broker.fatalError('Test fatal error before start', new Error('Fatal test error'));

      assert.strictEqual(stopSpy.mock.calls.length, 0);
      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });

    it('should handle graceful shutdown timeout', async () => {
      broker = createNode({
        nodeId: 'shutdown-timeout-test',
        logger: { enabled: false }
      });

      await broker.start();

      // Mock setTimeout to prevent actual timeout from firing
      let timeoutCallback;
      global.setTimeout = ((callback, delay) => {
        if (delay === 10000) {
          timeoutCallback = callback;
          return 'mocked-timeout' as any;
        }
        return originalSetTimeout(callback, delay);
      }) as any;

      // Mock broker.stop to hang indefinitely after start
      const stopSpy = mock.method(broker, 'stop', () =>
        new Promise(() => {}) // Never resolves
      );

      broker.fatalError('Test fatal error with timeout', new Error('Fatal test error'));

      // Wait a bit for the timeout to be set
      await new Promise(resolve => originalSetTimeout(resolve, 50));

      assert.strictEqual(stopSpy.mock.calls.length, 1);

      // Manually trigger the timeout to test the behavior
      if (timeoutCallback) {
        timeoutCallback();
        assert.strictEqual(exitMock.mock.calls.length, 1);
        assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
      }
    }, 10000);

    it('should handle broker stop rejection during graceful shutdown', async () => {
      broker = createNode({
        nodeId: 'stop-rejection-test',
        logger: { enabled: false }
      });

      const stopSpy = mock.method(broker, 'stop', () => Promise.reject(new Error('Stop failed')));

      await broker.start();

      broker.fatalError('Test fatal error with stop failure', new Error('Fatal test error'));

      // Wait for async shutdown process
      await new Promise(resolve => setTimeout(resolve, 100));

      assert.strictEqual(stopSpy.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });

    it('should handle fatal error when runtime state is not available', async () => {
      broker = createNode({
        nodeId: 'no-state-test',
        logger: { enabled: false }
      });

      await broker.start();

      // Simulate missing runtime state
      delete broker.runtime.state;

      broker.fatalError('Test fatal error without state', new Error('Fatal test error'));

      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });

    it('should handle fatal error when broker is not available', () => {
      broker = createNode({
        nodeId: 'no-broker-test',
        logger: { enabled: false }
      });

      // Remove broker reference to simulate error condition
      delete broker.runtime.broker;

      broker.fatalError('Test fatal error without broker', new Error('Fatal test error'));

      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });
  });

  describe('Error logging during fatal errors', () => {
    it('should log fatal errors appropriately', async () => {
      broker = createNode({
        nodeId: 'fatal-logging-test',
        logger: {
          enabled: true,
          level: 'debug'
        }
      });

      // Mock the logger
      broker.runtime.log.fatal = mock.fn();
      broker.runtime.log.warn = mock.fn();
      broker.runtime.log.error = mock.fn();
      broker.runtime.log.info = mock.fn();

      const stopSpy = mock.method(broker, 'stop', () => Promise.resolve());

      await broker.start();

      const testError = new Error('Test fatal error');
      broker.fatalError('Fatal error occurred', testError);

      // Wait for async logging
      await new Promise(resolve => setTimeout(resolve, 100));

      assert.strictEqual(broker.runtime.log.fatal.mock.calls.length, 1);
      assert.deepStrictEqual(broker.runtime.log.fatal.mock.calls[0].arguments[0], { error: testError });
      assert.strictEqual(broker.runtime.log.fatal.mock.calls[0].arguments[1], 'Fatal error occurred');
      assert.strictEqual(stopSpy.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });

    it('should handle fatal errors without error objects', async () => {
      broker = createNode({
        nodeId: 'fatal-no-error-test',
        logger: { enabled: false }
      });

      const stopSpy = mock.method(broker, 'stop', () => Promise.resolve());

      await broker.start();

      broker.fatalError('Fatal error without error object');

      await new Promise(resolve => setTimeout(resolve, 100));

      assert.strictEqual(stopSpy.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });
  });

  describe('Fatal error integration with broker lifecycle', () => {
    it('should handle fatal error during broker startup', async () => {
      broker = createNode({
        nodeId: 'startup-fatal-test',
        logger: { enabled: false }
      });

      // Create a service that will fail during startup
      broker.createService({
        name: 'fatalService',
        started () {
          broker.fatalError('Fatal error during startup', new Error('Startup failure'));
          return Promise.resolve();
        }
      });

      // Start the broker - fatal error should be triggered during startup
      await broker.start();

      // Wait for the fatal error handling
      await new Promise(resolve => setTimeout(resolve, 100));

      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });

    it('should handle fatal error during broker shutdown', async () => {
      broker = createNode({
        nodeId: 'shutdown-fatal-test',
        logger: { enabled: false }
      });

      broker.createService({
        name: 'shutdownService',
        stopped () {
          broker.fatalError('Fatal error during shutdown', new Error('Shutdown failure'));
          return Promise.resolve();
        }
      });

      await broker.start();

      // This should trigger the fatal error during shutdown
      await broker.stop();

      assert.strictEqual(exitMock.mock.calls.length, 1);
      assert.strictEqual(exitMock.mock.calls[0].arguments[0], 1);
    });
  });
});
