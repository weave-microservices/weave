const { Transform } = require('stream')

const pushWithBackpressure = (stream, chunks, encoding, callback = null, $index = 0) => {
  if (!(stream instanceof Transform)) {
    throw new TypeError('Argument "stream" must be an instance of Duplex')
  }
  chunks = [].concat(chunks).filter(x => x !== undefined)
  if (typeof encoding === 'function') {
    callback = encoding
    encoding = undefined
  }
  if ($index >= chunks.length) {
    if (typeof callback === 'function') {
      callback()
    }
    return stream
  } else if (!stream.push(chunks[$index], ...([encoding].filter(Boolean)))) {
    stream.emit('backpressure', {
      sender: stream.sender,
      requestId: stream.requestId
    })
    const pipedStreams = [].concat(
      (stream._readableState || {}).pipes || stream
    ).filter(Boolean)
    let listenerCalled = false
    const drainListener = () => {
      stream.emit('resume_backpressure', {
        sender: stream.sender,
        requestId: stream.requestId
      })
      if (listenerCalled) {
        return
      }
      listenerCalled = true
      for (const stream of pipedStreams) {
        stream.removeListener('drain', drainListener)
      }
      pushWithBackpressure(stream, chunks, encoding, callback, $index + 1)
    }
    for (const stream of pipedStreams) {
      stream.once('drain', drainListener)
    }
    return stream
  }
  return pushWithBackpressure(stream, chunks, encoding, callback, $index + 1)
}
class InboundTransformStream extends Transform {
  constructor (sender, requestId, options) {
    super(options)
    this.sender = sender
    this.requestId = requestId
  }

  _transform (chunk, encoding, callback) {
    pushWithBackpressure(this, chunk, encoding, callback)
  }

  _flush (callback) {
    return callback()
  }
}

module.exports = { InboundTransformStream }
