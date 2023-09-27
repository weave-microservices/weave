exports.errorHandler = ({ options }, error) => {
  if (options.errorHandler) {
    return options.errorHandler.call(null, error);
  }
  throw error;
};

exports.fatalErrorHandler = (runtime, message, error, killProcess = true) => {
  const { options, log } = runtime;
  if (options.logger.enabled) {
    log.fatal({ error }, message);
  } else {
    console.error(message, error);
  }

  if (killProcess) {
    process.exit(1);
  }
};
