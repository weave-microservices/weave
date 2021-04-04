const { Writable } = require('stream')
const { defaultsDeep } = require('@weave-js/utils')

const adapterDefaultOptions = {
  // format: null
}
module.exports = class TransportStream extends Writable {
  constructor (transportOptions, loggerOptions) {
    super({ objectMode: true })
    transportOptions = defaultsDeep(adapterDefaultOptions, transportOptions)

    this.level = transportOptions.level
    this.format = transportOptions.format
    this.options = transportOptions
    this.loggerOptions = loggerOptions

    // Get the levels from the source we are piped from.
    this.once('pipe', logger => {
      // Remark (indexzero): this bookkeeping can only support multiple
      // Logger parents with the same `levels`. This comes into play in
      // the `winston.Container` code in which `container.add` takes
      // a fully realized set of options with pre-constructed TransportStreams.
      this.levels = logger.levels
      this.parent = logger
    })

    // If and/or when the transport is removed from this instance
    this.once('unpipe', src => {
      // Remark (indexzero): this bookkeeping can only support multiple
      // Logger parents with the same `levels`. This comes into play in
      // the `winston.Container` code in which `container.add` takes
      // a fully realized set of options with pre-constructed TransportStreams.
      if (src === this.parent) {
        this.parent = null
        if (this.close) {
          this.close()
        }
      }
    })
  }

  _write (logMessage, enc, callback) {
    const level = this.level || this.parent.level
    if (!level || this.levels[level] >= this.levels[logMessage.level]) {
      if (logMessage && !this.format) {
        return this.log(logMessage, callback)
      }

      let transformed
      let errorState

      try {
        transformed = this.format.transform(logMessage, this.loggerOptions)
      } catch (error) {
        errorState = error
      }

      if (errorState || !transformed) {
        callback()
        if (errorState) {
          throw errorState
        }
        return
      }

      // this.format
      return this.log(transformed, callback)
    }
    return callback(null)
  }
}
