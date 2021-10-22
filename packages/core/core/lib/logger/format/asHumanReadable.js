const { green, magenta, red, yellow, white, gray, cyan } = require('../utils/colorize')
const os = require('os')

exports.asHumanReadable = ({ levels, options }, originObj, message, number, time) => {
  let logResult = ''

  const logLevelColors = {
    fatal: magenta,
    error: red,
    warn: yellow,
    info: green,
    debug: cyan,
    verbose: gray
  }

  const currentLabel = levels.labels[number]

  // Log level label
  logResult += logLevelColors[currentLabel](currentLabel.toUpperCase())

  // date time
  logResult += ' [' + new Date(time).toISOString() + '] '

  if (options.base.pid && options.base.hostname) {
    logResult += ` (${options.base.pid} on ${options.base.hostname})`
  }

  if (message) {
    logResult += ' ' + logLevelColors[currentLabel](message)
  }

  if (Object.keys(originObj).length > 0) {
    // logResult += gray(' Json:')
    logResult += os.EOL
    logResult += gray(JSON.stringify(originObj, null, 2))
  }

  logResult += os.EOL

  return logResult
}