
const { Writable } = require('stream')
const { resolveMessageType } = require('../../../message-types')

module.exports = class TCPWriteStream extends Writable {
    constructor () {
        super()
        this.buffer = null
    }

    _write (chunk, encoding, callback) {
        let packet = chunk

        while (packet.length > 0) {
            if (packet.length < 6) {
                this.buffer = Buffer.from(packet)
                callback()
            }

            const crc = packet[1] ^ packet[2] ^ packet[3] ^ packet[4] ^ packet[5]
            console.log(packet[0])
            if (crc !== packet[0]) {
                callback(new Error(`Invalid cyclic redundancy check.`))
            }

            const length = packet.readInt32BE(1)
            if (packet.length >= length) {
                const message = packet.slice(6, length)
                const type = resolveMessageType(packet[5])

                this.emit('data', type, message)
                packet = packet.slice(length)
            } else {
                this.buffer = Buffer.from(packet)
                return callback()
            }
        }
        callback()
    }
}
