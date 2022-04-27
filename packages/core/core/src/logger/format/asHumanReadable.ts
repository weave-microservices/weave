import os from 'os';
import { LoggerRuntime } from '../LoggerRuntime';
import { green, magenta, red, yellow, gray, cyan } from '../utils/colorize';

const asHumanReadable = function (runtime: LoggerRuntime, originObject: object, message: string, logLevelValue: number, timestamp: number): string {
  const { levels, options } = runtime
  let logResult: string = '';

  const logLevelColors: any = {
    fatal: magenta,
    error: red,
    warn: yellow,
    info: green,
    debug: cyan,
    verbose: gray
  };

  const currentLabel = levels.labels[logLevelValue];

  const color = logLevelColors[currentLabel] || yellow;
  // Log level label
  logResult += color(currentLabel.toUpperCase());

  // date time
  logResult += ' [' + new Date(timestamp).toISOString() + '] ';

  if (options.base.pid && options.base.hostname) {
    logResult += ` (${options.base.pid} on ${options.base.hostname})`;
  }

  if (message) {
    logResult += ' ' + color(message);
  }

  if (Object.keys(originObject).length > 0) {
    // logResult += gray(' Json:')
    logResult += os.EOL;
    logResult += gray(JSON.stringify(originObject, null, 2));
  }

  logResult += os.EOL;

  return logResult;
};

export { asHumanReadable };