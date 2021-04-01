const { Transform } = require('stream')
const formatRegExp = /%[scdjifoO%]/g;

module.exports = class Logger extends Transform {
  constructor (loggerOptions) {
    super({ objectMode: true })
    this.configure(loggerOptions)
  }

  configure ({
    enabled,
    streams,
    format,
    defaultMeta,
    levels,
    level
  }) {
    this.enabled = enabled
    this.format = format
    this.defaultMeta = defaultMeta
    this.levels = levels
    this.level = level
    
    if (streams) {
      streams.forEach(stream => this.add(stream))
    }
  }

  add (stream) {
    const target = stream

    if (!target._writableState || !target._writableState.objectMode) {
      throw new Error('Transports must WritableStreams in objectMode. Set { objectMode: true }.')
    }

    // Listen for the `error` event and the `warn` event on the new Transport.
    // this._onEvent('error', target)
    // this._onEvent('warn', target)
    this.pipe(target)

    if (stream.handleExceptions) {
      this.exceptions.handle()
    }

    if (stream.handleRejections) {
      this.rejections.handle()
    }

    return this
  }

  attachDefaultMetaData (message) {
    if (this.defaultMeta) {
      message.meta = Object.assign({}, message.meta, this.defaultMeta)
    }
  }

  log (level, message, ...args) {
    // if (arguments === 1) {5
    // }

    if (arguments.length === 2) {
      if (message && typeof message === 'object') {
        message.level = type.level
        this.attachDefaultMetaData(message)
        message.meta = { type }
        this.write(message)
        return this
      }

      message = { level, message, meta: { type }}
      this.attachDefaultMetaData(message)
      this.write(message)
      return this
    }

    const [meta] = args
    if (meta && typeof meta === 'object') {
      const tokens = message && message.match && message.match(formatRegExp);
      if (!tokens) {
        const logObj = Object.assign({}, {
          level,
          message,
          meta: {
            ...meta
          }
        })
        this.attachDefaultMetaData(logObj)


        this.write(logObj)
        return this
      }
    }

    this.write(Object.assign({}, {
      level,
      message,
      meta: {
        ...this.defaultMeta
      }
    }))
    return this
  }

  _transform (info, enc, callback) {
    if (!this._readableState.pipes || this._readableState.pipes.length === 0) {
      console.error('Attempt to write logs with no transports %j', info)
    }

    if (this.format) {
      info = this.format.transform(info)
    }

    try {
      this.push(info)
    } catch (ex) {
      throw ex
    } finally {
      callback()
    }
  }
}
