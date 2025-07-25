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
    // Graceful shutdown instead of immediate process.exit
    if (broker && runtime.state && runtime.state.isStarted) {
      log.warn('Attempting graceful shutdown due to fatal error...');

      // Set a timeout to prevent hanging indefinitely
      const shutdownTimeout = setTimeout(() => {
        log.error('Graceful shutdown timed out, forcing exit');
        process.exit(1);
      }, 10000); // 10 second timeout

      broker.stop()
        .then(() => {
          clearTimeout(shutdownTimeout);
          log.info('Graceful shutdown completed');
          process.exit(1);
        })
        .catch((shutdownError) => {
          clearTimeout(shutdownTimeout);
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
