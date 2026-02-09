import type { Runtime } from "../types/index.js";
import type { LoggerOptions } from "../types/index.js";

export const errorHandler = (runtime: Runtime, error: Error): void => {
  if (runtime.options.errorHandler) {
    return runtime.options.errorHandler.call(null, error);
  }
  throw error;
};

export const fatalErrorHandler = (
  runtime: Runtime,
  message?: string,
  error?: Error,
  killProcess: boolean = true,
): void => {
  const { options, log, broker } = runtime;
  const loggerOptions = options.logger as LoggerOptions | undefined;
  if (loggerOptions?.enabled) {
    log.fatal({ error }, message);
  } else {
    console.error(message, error);
  }

  if (killProcess) {
    // Graceful shutdown instead of immediate process.exit
    if (broker && runtime.state && runtime.state.isStarted) {
      log.warn("Attempting graceful shutdown due to fatal error");

      // Set a timeout to prevent hanging indefinitely
      const shutdownTimeout = setTimeout(() => {
        log.error("Graceful shutdown timed out, forcing exit");
        process.exit(1);
      }, 10000); // 10 second timeout

      broker
        .stop()
        .then(() => {
          clearTimeout(shutdownTimeout);
          log.info("Graceful shutdown completed");
          process.exit(1);
        })
        .catch((shutdownError: Error) => {
          clearTimeout(shutdownTimeout);
          log.error("Graceful shutdown failed:", shutdownError);
          process.exit(1);
        });
    } else {
      // Fallback to immediate exit if broker not available or not started
      log.warn("Broker not started or unavailable, performing immediate exit");
      process.exit(1);
    }
  }
};
