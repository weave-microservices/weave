import { BrokerOptions } from './broker/defaultOptions';
import { Runtime } from './types';

export function errorHandler (options: BrokerOptions, error) {
  if (options.errorHandler) {
    return options.errorHandler.call(null, error);
  }
  throw error;
};

export function fatalErrorHandler (runtime: Runtime, message: string, error: Error, killProcess: boolean = true) {
  const { options, log } = runtime;
  if (options.logger.enabled) {
    log.fatal(error, message);
  } else {
    console.error(message, error);
  }

  if (killProcess) {
    process.exit(1);
  }
};
