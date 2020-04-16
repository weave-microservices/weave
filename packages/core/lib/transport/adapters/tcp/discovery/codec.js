module.exports = function createCodec (options) {
  return {
    encode (object) {
      return new Buffer(JSON.stringify(object))
    },
    decode (buffer) {
      return JSON.parse(buffer.toString())
    }
  }
}
