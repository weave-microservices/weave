module.exports = function createCodec (options) {
  return {
    encode (object) {
      return Buffer.from(JSON.stringify(object))
    },
    decode (buffer) {
      return JSON.parse(buffer.toString())
    }
  }
}
