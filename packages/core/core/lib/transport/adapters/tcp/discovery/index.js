const dgram = require('dgram');
const { getIpList } = require('@weave-js/utils');
const EventEmitter = require('events').EventEmitter;
const Codec = require('./codec');
const { getBroadcastAddresses } = require('../utils');
const messageTypes = {
  HELLO: 4
};

const createDiscoveryService = (adapter, options) => {
  const namespace = adapter.broker.options.namespace;
  const codec = Codec(options);
  const bus = new EventEmitter();
  const ips = getIpList(false);
  const MESSAGE_TYPE_LENGTH = 1;

  let servers = [];
  let discoverTimer;

  const startServer = (host, port, multicastAddress) => {
    return new Promise((resolve, reject) => {
      try {
        const socket = dgram.createSocket({
          type: options.discovery.type,
          reuseAddr: options.discovery.udpReuseAddress
        });

        socket.on('message', onMessage);

        socket.bind({ port, exclusive: true }, () => {
          try {
            if (multicastAddress) {
              socket.setMulticastInterface(host);
              socket.addMembership(multicastAddress, host);
              socket.setMulticastTTL(1);
              // Add destination to socket object
              Object.defineProperty(socket, 'destinations', {
                value: [multicastAddress]
              });
              adapter.log.info(`UDP Server is listening on ${host}:${port}. Membership: ${multicastAddress}`);
            } else {
              socket.setBroadcast(true);
              Object.defineProperty(socket, 'destinations', {
                value: getBroadcastAddresses()
              });
            }
          } catch (error) {
            adapter.log.info(`UDP Multicast membership error: ${error.message}`);
          }
        });

        servers.push(socket);

        resolve(socket);
      } catch (error) {
        reject(error);
      }
    });
  };

  const onMessage = (buffer, info) => {
    const messageType = Buffer.prototype.readUInt8.call(buffer, 0);
    const payload = buffer.slice(MESSAGE_TYPE_LENGTH);

    switch (messageType) {
    case messageTypes.HELLO:
      const message = codec.decode(payload);
      message.host = info.address;

      if (message.namespace === namespace) {
        bus.emit('message', message);
      }
      break;
    default:
      adapter.log.debug(`Received an unknown data package from host "${info.address}"`);
    }
  };

  function sendMessage (payload) {
    const header = Buffer.alloc(MESSAGE_TYPE_LENGTH);
    Buffer.prototype.writeUInt8.call(header, messageTypes.HELLO, 0);

    const message = Buffer.concat([header, codec.encode(payload)]);

    servers.forEach(server => {
      server.destinations.forEach(host => {
        server.send(message, options.discovery.port, host, (error) => {
          if (!error) {
            adapter.log.verbose(`Message sent to ${host}:${options.discovery.port}`);
          }
        });
      });
    });
  }

  function sendDiscoveryPackage (port) {
    sendMessage({
      namespace: adapter.broker.options.namespace,
      nodeId: adapter.broker.nodeId,
      port: port
    });
  }

  function startDiscovering (port) {
    discoverTimer = setInterval(() => sendDiscoveryPackage(port), 2000);
    discoverTimer.unref();
  }

  function stopDiscovery () {
    if (discoverTimer) {
      clearInterval(discoverTimer);
      discoverTimer = null;
      adapter.log.info('UDP discovery service stopped');
    }
  }

  return {
    bus,
    async start (port) {
      if (!options.discovery.enabled) {
        return Promise.resolve();
      }

      // UDP Multicast
      if (options.discovery.udpMulticast) {
        if (options.discovery.multicastAddress) {
          await Promise.all(ips.map(ip => startServer(ip, options.discovery.port, options.discovery.multicastAddress)));
        }
      }

      // UDP Broadcast
      if (options.discovery.udpBroadcast) {
        await startServer(options.discovery.udpBindAddress, options.discovery.port, options.discovery.multicastAddress);
      }

      // send the first dis
      const timeout = Math.floor(Math.random() * 500) + 500;
      setTimeout(() => sendDiscoveryPackage(port), timeout);
      startDiscovering(port);
    },
    close () {
      stopDiscovery();
      servers.forEach(server => server.close());
      servers = [];
    }
  };
};

module.exports = createDiscoveryService;
