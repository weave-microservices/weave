const { Writable } = require('stream');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'MessageTyp... Remove this comment to see the full error message
const MessageTypes = require('../../message-types');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'TCPMessage... Remove this comment to see the full error message
const TCPMessageTypeHelper = require('./tcp-messagetypes');
module.exports = class TCPWriteStream extends Writable {
    constructor(adapter, socket, maxPacketSize) {
        super();
        this.buffer = null;
        this.adapter = adapter;
        this.socket = socket;
        this.messageTypeHelper = TCPMessageTypeHelper(MessageTypes);
        this.maxPacketSize = maxPacketSize;
    }
    _write(chunk, encoding, callback) {
        let packet = chunk;
        if (this.buffer && this.buffer.length > 0) {
            packet = Buffer.concat([this.buffer, chunk]);
            this.buffer = null;
        }
        while (packet.length > 0) {
            if (packet.length < 6) {
                this.buffer = Buffer.from(packet);
                return callback();
            }
            if (packet.length > this.maxPacketSize) {
                return callback(new Error(`Incoming packet is larger than the 'maxPacketSize' limit (${packet.length} > ${this.maxPacketSize})!`));
            }
            const crc = packet[1] ^ packet[2] ^ packet[3] ^ packet[4] ^ packet[5];
            if (crc !== packet[0]) {
                return callback(new Error('Invalid cyclic redundancy check.'));
            }
            const length = packet.readInt32BE(1);
            if (packet.length >= length) {
                const message = packet.slice(6, length);
                const type = this.messageTypeHelper.getTypeByIndex(packet[5]); // resolveMessageType(packet[5])
                this.emit('data', type, message, this.socket);
                packet = packet.slice(length);
            }
            else {
                this.buffer = Buffer.from(packet);
                return callback();
            }
        }
        callback();
    }
};
