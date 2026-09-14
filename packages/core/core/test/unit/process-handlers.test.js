const { registerProcessHandlers } = require('../../lib/broker/processHandlers');

const createRuntimeMock = (processOptions) => ({
  options: processOptions === undefined ? {} : { process: processOptions },
  log: {
    error: jest.fn()
  },
  fatalError: jest.fn()
});

const createBrokerMock = () => ({
  stop: jest.fn(() => Promise.resolve())
});

describe('Test process handlers', () => {
  let unregister;

  afterEach(() => {
    if (unregister) {
      unregister();
      unregister = null;
    }
  });

  describe('Listener registration', () => {
    it('should register the shutdown listeners', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'log' });
      const before = {
        beforeExit: process.listenerCount('beforeExit'),
        exit: process.listenerCount('exit'),
        sigint: process.listenerCount('SIGINT'),
        sigterm: process.listenerCount('SIGTERM')
      };

      unregister = registerProcessHandlers(runtime, createBrokerMock());

      expect(process.listenerCount('beforeExit')).toBe(before.beforeExit + 1);
      expect(process.listenerCount('exit')).toBe(before.exit + 1);
      expect(process.listenerCount('SIGINT')).toBe(before.sigint + 1);
      expect(process.listenerCount('SIGTERM')).toBe(before.sigterm + 1);
    });

    it('should register the unhandled error listeners', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'log' });
      const before = process.listenerCount('uncaughtException');

      unregister = registerProcessHandlers(runtime, createBrokerMock());

      expect(process.listenerCount('uncaughtException')).toBe(before + 1);
      expect(process.listenerCount('unhandledRejection')).toBe(before + 1);
    });

    it('should not register unhandled error listeners if the action is "none"', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'none' });
      const before = process.listenerCount('uncaughtException');

      unregister = registerProcessHandlers(runtime, createBrokerMock());

      expect(process.listenerCount('uncaughtException')).toBe(before);
      expect(process.listenerCount('unhandledRejection')).toBe(before);
    });

    it('should still register the shutdown listeners if the action is "none"', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'none' });
      const before = process.listenerCount('SIGINT');

      unregister = registerProcessHandlers(runtime, createBrokerMock());

      expect(process.listenerCount('SIGINT')).toBe(before + 1);
    });

    it('should fall back to "log" if no process options are set', () => {
      const runtime = createRuntimeMock(undefined);
      const before = process.listenerCount('uncaughtException');

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('uncaughtException', new Error('No options'));

      expect(process.listenerCount('uncaughtException')).toBe(before + 1);
      expect(runtime.log.error).toBeCalledTimes(1);
      expect(runtime.fatalError).not.toBeCalled();
    });

    it('should remove all listeners on unregister', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'log' });
      const before = {
        beforeExit: process.listenerCount('beforeExit'),
        exit: process.listenerCount('exit'),
        sigint: process.listenerCount('SIGINT'),
        sigterm: process.listenerCount('SIGTERM'),
        uncaught: process.listenerCount('uncaughtException'),
        rejection: process.listenerCount('unhandledRejection')
      };

      registerProcessHandlers(runtime, createBrokerMock())();

      expect(process.listenerCount('beforeExit')).toBe(before.beforeExit);
      expect(process.listenerCount('exit')).toBe(before.exit);
      expect(process.listenerCount('SIGINT')).toBe(before.sigint);
      expect(process.listenerCount('SIGTERM')).toBe(before.sigterm);
      expect(process.listenerCount('uncaughtException')).toBe(before.uncaught);
      expect(process.listenerCount('unhandledRejection')).toBe(before.rejection);
    });

    it('should not leak listeners if multiple brokers register and unregister', () => {
      const before = process.listenerCount('uncaughtException');

      const unregisterFirst = registerProcessHandlers(createRuntimeMock({ unhandledErrorAction: 'log' }), createBrokerMock());
      const unregisterSecond = registerProcessHandlers(createRuntimeMock({ unhandledErrorAction: 'log' }), createBrokerMock());

      expect(process.listenerCount('uncaughtException')).toBe(before + 2);

      unregisterFirst();
      unregisterSecond();

      expect(process.listenerCount('uncaughtException')).toBe(before);
    });

    it('should only remove its own listeners', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'log' });
      const otherRuntime = createRuntimeMock({ unhandledErrorAction: 'log' });

      unregister = registerProcessHandlers(otherRuntime, createBrokerMock());
      registerProcessHandlers(runtime, createBrokerMock())();

      process.emit('uncaughtException', new Error('Still listening'));

      expect(otherRuntime.log.error).toBeCalledTimes(1);
      expect(runtime.log.error).not.toBeCalled();
    });
  });

  describe('Action "log"', () => {
    it('should only log an uncaught exception', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'log' });
      const error = new Error('Something went wrong');

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('uncaughtException', error);

      expect(runtime.log.error).toBeCalledTimes(1);
      expect(runtime.log.error).toBeCalledWith(
        { error, origin: 'uncaughtException' },
        'Unhandled error (uncaughtException): Something went wrong'
      );
      expect(runtime.fatalError).not.toBeCalled();
    });

    it('should only log an unhandled rejection', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'log' });
      const error = new Error('Rejected');

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('unhandledRejection', error, Promise.resolve());

      expect(runtime.log.error).toBeCalledWith(
        { error, origin: 'unhandledRejection' },
        'Unhandled error (unhandledRejection): Rejected'
      );
      expect(runtime.fatalError).not.toBeCalled();
    });

    it('should not stop the broker', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'log' });
      const broker = createBrokerMock();

      unregister = registerProcessHandlers(runtime, broker);
      process.emit('uncaughtException', new Error('Something went wrong'));

      expect(broker.stop).not.toBeCalled();
    });

    it('should log every error that occurs', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'log' });

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('uncaughtException', new Error('First'));
      process.emit('uncaughtException', new Error('Second'));

      expect(runtime.log.error).toBeCalledTimes(2);
    });
  });

  describe('Action "stop"', () => {
    it('should stop the node on an uncaught exception', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'stop' });
      const error = new Error('Something went wrong');

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('uncaughtException', error);

      expect(runtime.fatalError).toBeCalledTimes(1);
      expect(runtime.fatalError).toBeCalledWith(
        'Unhandled error (uncaughtException). Node will be stopped.',
        error,
        true
      );
    });

    it('should stop the node on an unhandled rejection', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'stop' });
      const error = new Error('Rejected');

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('unhandledRejection', error, Promise.resolve());

      expect(runtime.fatalError).toBeCalledWith(
        'Unhandled error (unhandledRejection). Node will be stopped.',
        error,
        true
      );
    });

    it('should not log the error itself, because fatalError does that', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'stop' });

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('uncaughtException', new Error('Something went wrong'));

      expect(runtime.log.error).not.toBeCalled();
    });
  });

  describe('Action "none"', () => {
    it('should neither log nor stop the node', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'none' });

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('unhandledRejection', new Error('Rejected'), Promise.resolve());

      expect(runtime.log.error).not.toBeCalled();
      expect(runtime.fatalError).not.toBeCalled();
    });
  });

  describe('Non error rejection reasons', () => {
    it('should wrap a string reason in an error', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'stop' });

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('unhandledRejection', 'just a string', Promise.resolve());

      const [, error] = runtime.fatalError.mock.calls[0];

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Promise rejected with a non-error value: just a string');
    });

    it('should wrap an undefined reason in an error', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'stop' });

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('unhandledRejection', undefined, Promise.resolve());

      const [, error] = runtime.fatalError.mock.calls[0];

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Promise rejected with a non-error value: undefined');
    });

    it('should wrap an object reason in an error', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'stop' });

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('unhandledRejection', { code: 500 }, Promise.resolve());

      const [, error] = runtime.fatalError.mock.calls[0];

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Promise rejected with a non-error value: [object Object]');
    });

    it('should keep a subclassed error untouched', () => {
      const runtime = createRuntimeMock({ unhandledErrorAction: 'stop' });

      class CustomError extends Error {}
      const error = new CustomError('Custom');

      unregister = registerProcessHandlers(runtime, createBrokerMock());
      process.emit('unhandledRejection', error, Promise.resolve());

      expect(runtime.fatalError.mock.calls[0][1]).toBe(error);
    });
  });
});
