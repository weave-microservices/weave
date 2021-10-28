const { Transform } = require('stream')

class InboundTransformStream extends Transform {
  _pushWithBackpressure (chunk, encoding, callback, index = 0) {
    // const backpresure = this.push(chunk)
    if (!this.push(chunk)) {
      this.once('drain', () => {
        this._pushWithBackpressure(chunk, encoding, callback, index++)
      })

      this.emit('backpressure')
      return
    } else {
      this.emit('resume_backpressure')
    }
    callback()

  }

  _transform (chunk, encoding, callback) {
    // const backpresure = this.push(chunk)
    this._pushWithBackpressure(chunk, encoding, callback)
  }
}

module.exports = { InboundTransformStream }