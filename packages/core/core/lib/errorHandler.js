// Guards against multiple parallel shutdowns of the same runtime. Without it,
// every further unhandled error that occurs while the broker is shutting down
// would start another shutdown and another exit timer.
const shuttingDownRuntimes = new WeakSet();

const DEFAULT_FATAL_ERROR_SHUTDOWN_TIMEOUT = 7000;

exports.errorHandler = ({ options }, error) => {
  if (options.errorHandler) {
    return options.errorHandler.call(null, error);
  }
  throw error;
};

exports.fatalErrorHandler = (runtime, message, error, killProcess = true) => {
  const { options, log, broker } = runtime;
  if (options.logger.enabled) {
    log.fatal({ error }, message);
  } else {
    console.error(message, error);
  }

  if (killProcess) {
    if (shuttingDownRuntimes.has(runtime)) {
      log.warn('Shutdown after a fatal error is already in progress.');
      return;
    }

    shuttingDownRuntimes.add(runtime);

    // Graceful shutdown instead of immediate process.exit
    if (broker && runtime.state && runtime.state.isStarted) {
      log.warn('Attempting graceful shutdown due to fatal error...');

      // Not to be confused with "contextTracking.shutdownTimeout": this is the
      // upper bound for the whole shutdown, the other one is the time broker.stop()
      // waits for still running contexts.
      const shutdownTimeout = (options.process && options.process.fatalErrorShutdownTimeout) || DEFAULT_FATAL_ERROR_SHUTDOWN_TIMEOUT;

      // Set a timeout to prevent hanging indefinitely
      const shutdownTimer = setTimeout(() => {
        log.error('Graceful shutdown timed out, forcing exit');
        process.exit(1);
      }, shutdownTimeout);

      broker.stop()
        .then(() => {
          clearTimeout(shutdownTimer);
          log.info('Graceful shutdown completed');
          process.exit(1);
        })
        .catch((shutdownError) => {
          clearTimeout(shutdownTimer);
          log.error('Graceful shutdown failed:', shutdownError);
          process.exit(1);
        });
    } else {
      // Fallback to immediate exit if broker not available or not started
      log.warn('Broker not started or unavailable, performing immediate exit');
      process.exit(1);
    }
  }
};
