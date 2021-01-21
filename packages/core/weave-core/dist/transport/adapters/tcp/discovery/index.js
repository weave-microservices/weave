const dgram = require('dgram');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'getIpList'... Remove this comment to see the full error message
const { getIpList } = require('@weave-js/utils');
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'EventEmitt... Remove this comment to see the full error message
const EventEmitter = require('events').EventEmitter;
const Codec = require('./codec');
const messageTypes = {
    HELLO: 4
};
const createDiscoveryService = (adapter, options) => {
    const namespace = adapter.broker.options.namespace;
    const codec = Codec(options);
    const bus = new EventEmitter();
    const ips = getIpList(false);
    const MESSAGE_TYPE_LENGHT = 1;
    let servers = [];
    let discoverTimer;
    const startServer = (host, port, multicastAddress) => {
        return new Promise((resolve, reject) => {
            try {
                const socket = dgram.createSocket({ type: options.discovery.type, reuseAddr: options.discovery.udpReuseAddress });
                socket.on('message', (message, info) => {
                    const messageType = Buffer.prototype.readUInt8.call(message, 0);
                    const payload = message.slice(MESSAGE_TYPE_LENGHT);
                    switch (messageType) {
                        case messageTypes.HELLO:
                            onMessage(payload, info);
                            break;
                        default:
                            onUnknown(payload, info);
                    }
                });
                socket.bind({ port, host, exclusive: true }, () => {
                    socket.setMulticastInterface(host);
                    socket.addMembership(multicastAddress, host);
                    socket.setMulticastTTL(1);
                    socket.destinations = [multicastAddress];
                    adapter.log.info(`listening to ${host}:${port}`);
                });
                servers.push(socket);
                resolve(socket);
            }
            catch (error) {
                reject(error);
            }
        });
    };
    const onMessage = (buffer, info) => {
        const message = codec.decode(buffer);
        message.host = info.address;
        if (message.namespace === namespace) {
            bus.emit('message', message);
        }
    };
    const onUnknown = (message, info) => {
        adapter.log.debug(`Received an unknown data package from host "${info.address}"`);
    };
    function sendMessage(payload) {
        const header = Buffer.alloc(MESSAGE_TYPE_LENGHT);
        Buffer.prototype.writeUInt8.call(header, messageTypes.HELLO, 0);
        const message = Buffer.concat([header, codec.encode(payload)]);
        servers.forEach(server => {
            server.destinations.forEach(host => {
                server.send(message, options.discovery.port, host, (error) => {
                    if (!error) {
                        adapter.log.trace(`Message sent to ${host}:${options.discovery.port}`);
                    }
                });
            });
        });
    }
    function sendDiscoveryPackage(port) {
        sendMessage({
            namespace: adapter.broker.options.namespace,
            nodeId: adapter.broker.nodeId,
            port: port
        });
    }
    function startDiscovering(port) {
        discoverTimer = setInterval(() => sendDiscoveryPackage(port), 2000);
        discoverTimer.unref();
    }
    function stopDiscovery() {
        if (discoverTimer) {
            clearInterval(discoverTimer);
            discoverTimer = null;
            adapter.log.info('UDP discovery service stopped');
        }
    }
    return {
        bus,
        init(port) {
            if (!options.discovery.enabled) {
                return Promise.resolve();
            }
            return Promise.all(ips.map(ip => startServer(ip, options.discovery.port, options.discovery.multicastAddress)))
                .then(() => setTimeout(() => sendDiscoveryPackage(port), Math.floor(Math.random() * 500) + 1))
                .then(() => startDiscovering(port));
        },
        close() {
            stopDiscovery();
            servers.forEach(server => server.close());
            servers = [];
        }
    };
};
module.exports = createDiscoveryService;
