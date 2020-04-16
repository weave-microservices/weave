
const { Writable } = require('stream')
const MessageTypes = require('../../message-types')
const TCPMessageTypeHelper = require('./tcp-messagetypes')

module.exports = class TCPWriteStream extends Writable {
  constructor (adapter, socket) {
    super()
    this.buffer = null
    this.adapter = adapter
    this.socket = socket
    this.messageTypeHelper = TCPMessageTypeHelper(MessageTypes)
  }

  _write (chunk, encoding, callback) {
    let packet = chunk

    while (packet.length > 0) {
      if (packet.length < 6) {
        this.buffer = Buffer.from(packet)
        callback()
      }

      const crc = packet[1] ^ packet[2] ^ packet[3] ^ packet[4] ^ packet[5]
      if (crc !== packet[0]) {
        callback(new Error('Invalid cyclic redundancy check.'))
      }

      const length = packet.readInt32BE(1)
      if (packet.length >= length) {
        const message = packet.slice(6, length)
        const type = this.messageTypeHelper.getTypeByIndex(packet[5]) // resolveMessageType(packet[5])

        this.emit('data', type, message, this.socket)
        packet = packet.slice(length)
      } else {
        this.buffer = Buffer.from(packet)
        return callback()
      }
    }
    callback()
  }
}
