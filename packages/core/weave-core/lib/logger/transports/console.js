const WritableStream = require('stream').Writable

class ConsoleStream extends WritableStream {
  constructor (adapterOptions, loggerOptions) {
    super()
    this.adapterOptions = adapterOptions
    this.loggerOptions = loggerOptions
  }

  _write (chunk, enc, next) {
    console.log(chunk.toString())
    next()
  }
}

exports.createConsoleLogTransport = (adapterOptions = {}) => ({ loggerOptions }) => {
  return new ConsoleStream(adapterOptions, loggerOptions)
}
