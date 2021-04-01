const os = require('os')
const TransportStream = require('../transport-stream')
const { defaultsDeep } = require('@weave-js/utils')

const adapterDefaultOptions = {
  stdErrorLevels: [],
  stdWarnLevels: [],
  eol: os.EOL
}

class ConsoleStream extends TransportStream {
  /**
   * Creates an instance of ConsoleStream.
   * @param {*} options Adapter options
   * @param {*} loggerOptions Logger options
   * @memberof ConsoleStream
   */
  constructor (options, loggerOptions) {
    options = defaultsDeep(adapterDefaultOptions, options)
    super(options, loggerOptions)
  }

  log (logMessage, callback) {
    if (this.options.stdErrorLevels.includes(logMessage.level)) {
      if (console._stderr) {
        console._stderr.write(`${logMessage.message}${this.eol}`)
      } else {
        console.error(logMessage.message)
      }

      if (callback) {
        callback()
      }
      return
    } else if (this.options.stdWarnLevels.includes(logMessage.level)) {
      if (console._stderr) {
        // In node.js console.warn is just an alias to "process.stderr"
        console._stderr.write(`${logMessage.message}${this.eol}`)
      } else {
        console.warn(logMessage.message)
      }

      if (callback) {
        callback()
      }
      return
    }

    if (console._stdout) {
      // Node.js maps `process.stdout` to `console._stdout`.
      console._stdout.write(`${logMessage.message}${this.options.eol}`)
    } else {
      // console.log adds a newline.
      console.log(logMessage.message)
    }

    if (callback) {
      callback()
    }
  }
}

exports.createConsoleLogTransport = (adapterOptions = {}) => (loggerOptions) => {
  return new ConsoleStream(adapterOptions, loggerOptions)
}
