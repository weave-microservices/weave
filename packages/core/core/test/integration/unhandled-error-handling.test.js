const path = require('path');
const { execFile } = require('child_process');
const { createNode } = require('../helper');

const HELPER_SCRIPT = path.join(__dirname, '../helper/unhandled-error-node.js');

/**
 * Runs the helper script in a real child process and resolves with its result.
 * @param {string} unhandledErrorAction - Value for the "process.unhandledErrorAction" option
 * @param {string} mode - "throw" for an uncaught exception, "reject" for an unhandled rejection
 * @returns {Promise<{ code: number, stdout: string }>} Exit code and stdout of the process
 */
const runNode = (unhandledErrorAction, mode) => new Promise((resolve) => {
  execFile(process.execPath, [HELPER_SCRIPT, unhandledErrorAction, mode], (error, stdout) => {
    resolve({ code: error ? error.code : 0, stdout });
  });
});

describe('Unhandled error handling', () => {
  let broker;
  let exitMock;
  let consoleErrorMock;
  let listenerBaseline;

  beforeAll(() => {
    listenerBaseline = process.listenerCount('uncaughtException');
  });

  afterAll(() => {
    // Guards against brokers that leak their handlers into other test suites.
    expect(process.listenerCount('uncaughtException')).toBe(listenerBaseline);
    expect(process.listenerCount('unhandledRejection')).toBe(listenerBaseline);
  });

  beforeEach(() => {
    exitMock = jest.spyOn(process, 'exit').mockImplementation((code) => code);
    // Fatal errors are written to the console, because the logger is disabled in tests.
    consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    if (broker) {
      // A mocked stop() would skip the listener cleanup and leak handlers into the next test.
      if (broker.stop.mockRestore) {
        broker.stop.mockRestore();
      }

      await broker.stop().catch(() => {});
    }
    broker = null;
    exitMock.mockRestore();
    consoleErrorMock.mockRestore();
  });

  describe('Broker option wiring', () => {
    it('should use "log" as default action', () => {
      broker = createNode({ nodeId: 'default-action-node' });

      expect(broker.options.process.unhandledErrorAction).toBe('log');
    });

    it('should register the unhandled error listeners on broker start', async () => {
      const before = process.listenerCount('uncaughtException');

      broker = createNode({ nodeId: 'listener-node' });
      await broker.start();

      expect(process.listenerCount('uncaughtException')).toBe(before + 1);
      expect(process.listenerCount('unhandledRejection')).toBe(before + 1);
    });

    it('should not register any listeners for a broker that was never started', () => {
      const before = {
        uncaught: process.listenerCount('uncaughtException'),
        sigint: process.listenerCount('SIGINT')
      };

      broker = createNode({ nodeId: 'never-started-node' });

      expect(process.listenerCount('uncaughtException')).toBe(before.uncaught);
      expect(process.listenerCount('SIGINT')).toBe(before.sigint);
    });

    it('should not register the listeners twice if the broker is started twice', async () => {
      const before = process.listenerCount('uncaughtException');

      broker = createNode({ nodeId: 'double-start-node' });
      await broker.start();
      await broker.start();

      expect(process.listenerCount('uncaughtException')).toBe(before + 1);
    });

    it('should tolerate a second stop call', async () => {
      const before = process.listenerCount('uncaughtException');

      broker = createNode({ nodeId: 'double-stop-node' });
      await broker.start();
      await broker.stop();
      await broker.stop();

      expect(process.listenerCount('uncaughtException')).toBe(before);
    });

    it('should not register the unhandled error listeners if the action is "none"', async () => {
      const before = process.listenerCount('uncaughtException');

      broker = createNode({
        nodeId: 'no-listener-node',
        process: { unhandledErrorAction: 'none' }
      });
      await broker.start();

      expect(process.listenerCount('uncaughtException')).toBe(before);
      expect(process.listenerCount('unhandledRejection')).toBe(before);
    });

    it('should remove the unhandled error listeners on broker stop', async () => {
      const before = process.listenerCount('uncaughtException');

      broker = createNode({ nodeId: 'cleanup-node' });
      await broker.start();
      await broker.stop();

      expect(process.listenerCount('uncaughtException')).toBe(before);
      expect(process.listenerCount('unhandledRejection')).toBe(before);
    });

    it('should not leak listeners over several broker lifecycles', async () => {
      const before = process.listenerCount('uncaughtException');

      for (let i = 0; i < 3; i++) {
        const node = createNode({ nodeId: `lifecycle-node-${i}` });
        await node.start();
        await node.stop();
      }

      expect(process.listenerCount('uncaughtException')).toBe(before);
    });
  });

  describe('Action "log" with a started broker', () => {
    it('should log an uncaught exception without stopping the node', async () => {
      broker = createNode({
        nodeId: 'log-action-node',
        process: { unhandledErrorAction: 'log' }
      });

      broker.runtime.log.error = jest.fn();
      const stopSpy = jest.spyOn(broker, 'stop');

      await broker.start();

      const error = new Error('Uncaught in service');
      process.emit('uncaughtException', error);

      expect(broker.runtime.log.error).toBeCalledWith(
        { error, origin: 'uncaughtException' },
        'Unhandled error (uncaughtException): Uncaught in service'
      );
      expect(stopSpy).not.toBeCalled();
      expect(exitMock).not.toBeCalled();
      expect(broker.runtime.state.isStarted).toBe(true);
    });

    it('should log an unhandled rejection without stopping the node', async () => {
      broker = createNode({
        nodeId: 'log-rejection-node',
        process: { unhandledErrorAction: 'log' }
      });

      broker.runtime.log.error = jest.fn();

      await broker.start();

      process.emit('unhandledRejection', new Error('Rejected in service'), Promise.resolve());

      expect(broker.runtime.log.error).toBeCalledTimes(1);
      expect(exitMock).not.toBeCalled();
      expect(broker.runtime.state.isStarted).toBe(true);
    });
  });

  describe('Action "stop" with a started broker', () => {
    it('should shut the node down gracefully and exit with code 1', async () => {
      broker = createNode({
        nodeId: 'stop-action-node',
        process: { unhandledErrorAction: 'stop' }
      });

      await broker.start();

      const stopSpy = jest.spyOn(broker, 'stop').mockResolvedValue();

      process.emit('uncaughtException', new Error('Uncaught in service'));

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(stopSpy).toBeCalled();
      expect(exitMock).toBeCalledWith(1);
    });

    it('should shut the node down on an unhandled rejection', async () => {
      broker = createNode({
        nodeId: 'stop-rejection-node',
        process: { unhandledErrorAction: 'stop' }
      });

      await broker.start();

      const stopSpy = jest.spyOn(broker, 'stop').mockResolvedValue();

      process.emit('unhandledRejection', new Error('Rejected in service'), Promise.resolve());

      await new Promise(resolve => setTimeout(resolve, 100));

      expect(stopSpy).toBeCalled();
      expect(exitMock).toBeCalledWith(1);
    });
  });

  describe('Action "none" with a started broker', () => {
    it('should not handle the error at all', async () => {
      broker = createNode({
        nodeId: 'none-action-node',
        process: { unhandledErrorAction: 'none' }
      });

      broker.runtime.log.error = jest.fn();

      await broker.start();

      process.emit('unhandledRejection', new Error('Rejected in service'), Promise.resolve());

      expect(broker.runtime.log.error).not.toBeCalled();
      expect(exitMock).not.toBeCalled();
      expect(broker.runtime.state.isStarted).toBe(true);
    });
  });

  describe('End to end behavior in a real process', () => {
    it('should keep the process alive on an uncaught exception if the action is "log"', async () => {
      const result = await runNode('log', 'throw');

      expect(result.stdout).toContain('SURVIVED');
      expect(result.code).toBe(0);
    }, 15000);

    it('should keep the process alive on an unhandled rejection if the action is "log"', async () => {
      const result = await runNode('log', 'reject');

      expect(result.stdout).toContain('SURVIVED');
      expect(result.code).toBe(0);
    }, 15000);

    it('should terminate the process on an uncaught exception if the action is "stop"', async () => {
      const result = await runNode('stop', 'throw');

      expect(result.stdout).not.toContain('SURVIVED');
      expect(result.code).toBe(1);
    }, 15000);

    it('should terminate the process on an unhandled rejection if the action is "stop"', async () => {
      const result = await runNode('stop', 'reject');

      expect(result.stdout).not.toContain('SURVIVED');
      expect(result.code).toBe(1);
    }, 15000);

    it('should fall back to the node default if the action is "none"', async () => {
      const result = await runNode('none', 'throw');

      expect(result.stdout).not.toContain('SURVIVED');
      expect(result.code).toBe(1);
    }, 15000);
  });
});
