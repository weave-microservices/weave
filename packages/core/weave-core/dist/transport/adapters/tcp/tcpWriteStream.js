"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TCPWriteStream = void 0;
const stream_1 = require("stream");
const message_types_1 = __importDefault(require("../../message-types"));
const tcp_messagetypes_1 = require("./tcp-messagetypes");
class TCPWriteStream extends stream_1.Writable {
    constructor(adapter, socket, maxPacketSize) {
        super();
        this.buffer = null;
        this.adapter = adapter;
        this.socket = socket;
        this.messageTypeHelper = tcp_messagetypes_1.createTCPMessageTypeHelper(message_types_1.default);
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
}
exports.TCPWriteStream = TCPWriteStream;
