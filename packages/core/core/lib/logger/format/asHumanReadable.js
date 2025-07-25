const { green, magenta, red, yellow, gray, cyan } = require('../utils/colorize');
const os = require('os');

exports.asHumanReadable = (runtime, originObj, message, number, time) => {
  let logResult = '';

  const logLevelColors = {
    fatal: magenta,
    error: red,
    warn: yellow,
    info: green,
    debug: cyan,
    verbose: gray
  };

  const currentLabel = runtime.levels.labels[number];

  const color = logLevelColors[currentLabel] || yellow;
  // Log level label
  logResult += color(currentLabel.toUpperCase());

  // date time
  logResult += ' [' + new Date(time).toISOString() + '] ';

  if (runtime.options.base.pid && runtime.options.base.hostname) {
    logResult += ` (${runtime.options.base.pid} on ${runtime.options.base.hostname})`;
  }

  if (message) {
    logResult += ' ' + color(message);
  }

  if (Object.keys(originObj).length > 0) {
    // logResult += gray(' Json:')
    logResult += os.EOL;
    logResult += gray(JSON.stringify(originObj, null, 2));
  }

  logResult += os.EOL;

  return logResult;
};
