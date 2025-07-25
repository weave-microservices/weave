const { createNode } = require('../helper');

describe('Fatal Error Handling', () => {
  let broker;
  let exitMock;
  let originalSetTimeout;

  beforeEach(() => {
    exitMock = jest.spyOn(process, 'exit').mockImplementation((code) => code);
    originalSetTimeout = global.setTimeout;
  });

  afterEach(async () => {
    exitMock.mockRestore();
    global.setTimeout = originalSetTimeout;
    if (broker && broker.runtime && broker.runtime.state && broker.runtime.state.isStarted) {
      // Restore any mocked stop method before cleanup
      if (broker.stop.mockRestore) {
        broker.stop.mockRestore();
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

      const stopSpy = jest.spyOn(broker, 'stop').mockResolvedValue();

      await broker.start();

      broker.fatalError('Test fatal error', new Error('Fatal test error'));

      // Wait for async shutdown process
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(stopSpy).toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should exit immediately when broker is not started', () => {
      broker = createNode({
        nodeId: 'immediate-exit-test',
        logger: { enabled: false }
      });

      const stopSpy = jest.spyOn(broker, 'stop').mockResolvedValue();

      broker.fatalError('Test fatal error before start', new Error('Fatal test error'));

      expect(stopSpy).not.toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should handle graceful shutdown timeout', async () => {
      broker = createNode({
        nodeId: 'shutdown-timeout-test',
        logger: { enabled: false }
      });

      await broker.start();

      // Mock setTimeout to prevent actual timeout from firing
      let timeoutCallback;
      global.setTimeout = jest.fn((callback, delay) => {
        if (delay === 10000) {
          timeoutCallback = callback;
          return 'mocked-timeout';
        }
        return originalSetTimeout(callback, delay);
      });

      // Mock broker.stop to hang indefinitely after start
      const stopSpy = jest.spyOn(broker, 'stop').mockImplementation(() =>
        new Promise(() => {}) // Never resolves
      );

      broker.fatalError('Test fatal error with timeout', new Error('Fatal test error'));

      // Wait a bit for the timeout to be set
      await new Promise(resolve => originalSetTimeout(resolve, 50));

      expect(stopSpy).toHaveBeenCalled();
      expect(global.setTimeout).toHaveBeenCalledWith(expect.any(Function), 10000);
      
      // Manually trigger the timeout to test the behavior
      if (timeoutCallback) {
        timeoutCallback();
        expect(exitMock).toHaveBeenCalledWith(1);
      }
    }, 10000);

    it('should handle broker stop rejection during graceful shutdown', async () => {
      broker = createNode({
        nodeId: 'stop-rejection-test',
        logger: { enabled: false }
      });

      const stopSpy = jest.spyOn(broker, 'stop').mockRejectedValue(new Error('Stop failed'));

      await broker.start();

      broker.fatalError('Test fatal error with stop failure', new Error('Fatal test error'));

      // Wait for async shutdown process
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(stopSpy).toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(1);
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

      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should handle fatal error when broker is not available', () => {
      broker = createNode({
        nodeId: 'no-broker-test',
        logger: { enabled: false }
      });

      // Remove broker reference to simulate error condition
      delete broker.runtime.broker;

      broker.fatalError('Test fatal error without broker', new Error('Fatal test error'));

      expect(exitMock).toHaveBeenCalledWith(1);
    });
  });

  describe('Error logging during fatal errors', () => {
    it('should log fatal errors appropriately', async () => {
      const logSpy = jest.fn();

      broker = createNode({
        nodeId: 'fatal-logging-test',
        logger: {
          enabled: true,
          level: 'debug'
        }
      });

      // Mock the logger
      broker.runtime.log.fatal = jest.fn();
      broker.runtime.log.warn = jest.fn();
      broker.runtime.log.error = jest.fn();
      broker.runtime.log.info = jest.fn();

      const stopSpy = jest.spyOn(broker, 'stop').mockResolvedValue();

      await broker.start();

      const testError = new Error('Test fatal error');
      broker.fatalError('Fatal error occurred', testError);

      // Wait for async logging
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(broker.runtime.log.fatal).toHaveBeenCalledWith({ error: testError }, 'Fatal error occurred');
      expect(stopSpy).toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    it('should handle fatal errors without error objects', async () => {
      broker = createNode({
        nodeId: 'fatal-no-error-test',
        logger: { enabled: false }
      });

      const stopSpy = jest.spyOn(broker, 'stop').mockResolvedValue();

      await broker.start();

      broker.fatalError('Fatal error without error object');

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(stopSpy).toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalledWith(1);
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

      expect(exitMock).toHaveBeenCalledWith(1);
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

      expect(exitMock).toHaveBeenCalledWith(1);
    });
  });
});
