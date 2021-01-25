"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTCPReader = void 0;
const net_1 = __importDefault(require("net"));
const events_1 = require("events");
const tcpWriteStream_1 = require("./tcpWriteStream");
function createTCPReader(adapter, options) {
    const self = Object.create(null);
    let sockets = [];
    let server;
    self.bus = new events_1.EventEmitter();
    self.isConnected = false;
    self.listen = () => {
        return new Promise((resolve, reject) => {
            server = net_1.default.createServer(socket => onTCPClientConnected(socket));
            server.on('error', error => {
                adapter.log.error('TCP server error', error);
                reject(error);
            });
            server.listen(options, () => {
                const port = server.address().port;
                self.isConnected = true;
                adapter.log.info(`TCP server is listening on port ${port}`);
                resolve(port);
            });
        });
    };
    self.close = () => {
        if (server && self.isConnected) {
            sockets.forEach(socket => socket.destroy());
            sockets = [];
        }
    };
    function onTCPClientConnected(socket) {
        sockets.push(socket);
        const parser = new tcpWriteStream_1.TCPWriteStream(adapter, socket, options.maxPacketSize);
        socket.pipe(parser);
        parser.on('error', error => {
            adapter.log.warn('Packet parser error!', error);
            closeSocket(socket);
        });
        parser.on('data', (type, message) => {
            self.bus.emit('message', type, message);
        });
        socket.on('error', error => {
            adapter.log.warn('TCP connection error!', error);
            closeSocket(socket);
        });
        socket.on('close', (isError) => {
            closeSocket(socket);
        });
    }
    function closeSocket(socket) {
        socket.destroy();
        sockets.splice(sockets.indexOf(socket), 1);
    }
    return self;
}
exports.createTCPReader = createTCPReader;
//# sourceMappingURL=tcpReader.js.map