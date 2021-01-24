"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTCPWriter = void 0;
const events_1 = require("events");
const message_types_1 = __importDefault(require("../../message-types"));
const tcp_messagetypes_1 = require("./tcp-messagetypes");
const custom_socket_1 = require("./custom-socket");
function createTCPWriter(adapter, options) {
    const self = Object.create(null);
    const sockets = new Map();
    const messageTypeHelper = tcp_messagetypes_1.createTCPMessageTypeHelper(message_types_1.default);
    const headerSize = 6;
    self.bus = new events_1.EventEmitter();
    const connect = nodeId => {
        const node = adapter.broker.registry.nodes.get(nodeId);
        if (!node) {
            return Promise.reject();
        }
        const host = node.IPList[0];
        const port = node.port;
        return new Promise((resolve, reject) => {
            try {
                const socket = new custom_socket_1.CustomSocket().connect({ host, port }, () => {
                    // send hello
                    socket.setNoDelay(true);
                    socket.nodeId = nodeId;
                    socket.lastUsage = Date.now();
                    addSocket(nodeId, socket, true);
                    adapter.sendHello(nodeId)
                        .then(() => resolve(socket))
                        .catch(error => reject(error));
                });
                socket.on('error', error => {
                    removeSocket(nodeId);
                    self.bus.emit('error', error, nodeId);
                    if (error) {
                        reject(error);
                    }
                });
                socket.unref();
            }
            catch (error) {
                if (error) {
                    reject(error);
                }
            }
        });
    };
    const addSocket = (nodeId, socket, force) => {
        const s = sockets.get(nodeId);
        if (!force && s && !s.destroyed) {
            return;
        }
        sockets.set(nodeId, socket);
    };
    const removeSocket = nodeId => {
        const socket = sockets.get(nodeId);
        if (socket && !socket.destroyed) {
            socket.destroy();
        }
        sockets.delete(nodeId);
    };
    self['send'] = function (nodeId, type, data) {
        return Promise.resolve()
            .then(() => {
            const socket = sockets.get(nodeId);
            if (socket && !socket.destroyed) {
                return socket;
            }
            return connect(nodeId);
        })
            .then(socket => {
            return new Promise((resolve, reject) => {
                const header = Buffer.alloc(headerSize);
                header.writeInt32BE(data.length + headerSize, 1);
                header.writeInt8(messageTypeHelper.getIndexByType(type), 5);
                const crc = header[1] ^ header[2] ^ header[3] ^ header[4] ^ header[5];
                header[0] = crc;
                const payload = Buffer.concat([header, data]);
                try {
                    socket.write(payload, () => {
                        resolve();
                    });
                }
                catch (error) {
                    removeSocket(nodeId);
                    reject(error);
                }
            });
        });
    };
    self['close'] = () => {
        sockets.forEach(socket => {
            if (!socket.destroyed) {
                socket.destroy();
            }
            socket.end();
        });
        sockets.clear();
    };
    return self;
}
exports.createTCPWriter = createTCPWriter;
