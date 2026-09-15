/**
 * @typedef {import('../../types').Runtime} Runtime
 * @typedef {import('../../types').Broker} Broker
 */

/**
 * Registers all process level listeners of a broker instance.
 *
 * Beside the shutdown signals (SIGINT, SIGTERM, beforeExit, exit) this also
 * installs handlers for errors that were never caught by the application
 * itself. The behavior is controlled by the "process.unhandledErrorAction"
 * broker option:
 *
 * - "stop" - log the error and shut the broker down gracefully (exit code 1) - default
 * - "log"  - only log the error and keep the process running
 * - "none" - do not attach any handler at all
 *
 * @param {Runtime} runtime - The broker runtime
 * @param {Broker} broker - The broker instance
 * @returns {function():void} Function that removes all registered listeners again
 */
exports.registerProcessHandlers = (runtime, broker) => {
  const { options, log } = runtime;

  /* istanbul ignore next */
  const onClose = () => broker.stop()
    .catch(error => log.error(error))
    .then(() => process.exit(0));

  const unhandledErrorAction = (options.process && options.process.unhandledErrorAction) || 'stop';

  /**
   * Handles an error that bubbled up to the process.
   * @param {Error} error - The unhandled error
   * @param {string} origin - Origin of the error ("uncaughtException" or "unhandledRejection")
   * @returns {void}
   */
  const handleUnhandledError = (error, origin) => {
    if (unhandledErrorAction === 'stop') {
      runtime.fatalError(`Unhandled error (${origin}). Node will be stopped.`, error, true);
      return;
    }

    log.error({ error, origin }, `Unhandled error (${origin}): ${error.message}`);
  };

  const onUncaughtException = (error) => handleUnhandledError(error, 'uncaughtException');

  const onUnhandledRejection = (reason) => handleUnhandledError(
    reason instanceof Error ? reason : new Error(`Promise rejected with a non-error value: ${String(reason)}`),
    'unhandledRejection'
  );

  process.setMaxListeners(0);
  process.on('beforeExit', onClose);
  process.on('exit', onClose);
  process.on('SIGINT', onClose);
  process.on('SIGTERM', onClose);

  if (unhandledErrorAction !== 'none') {
    process.on('uncaughtException', onUncaughtException);
    process.on('unhandledRejection', onUnhandledRejection);
  }

  return () => {
    process.removeListener('beforeExit', onClose);
    process.removeListener('exit', onClose);
    process.removeListener('SIGINT', onClose);
    process.removeListener('SIGTERM', onClose);
    process.removeListener('uncaughtException', onUncaughtException);
    process.removeListener('unhandledRejection', onUnhandledRejection);
  };
};
