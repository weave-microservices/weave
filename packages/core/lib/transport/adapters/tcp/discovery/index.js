const dgram = require('dgram')
const os = require('os')
const EventEmitter = require('events').EventEmitter
const Codec = require('./codec')

const getIPs = () => {
  const interfaces = os.networkInterfaces()

  return Object.keys(interfaces).map(name => {
    return interfaces[name]
      .filter(int => int.family === 'IPv4')
      .map(int => int.address)
  }).reduce((a, b) => a.concat(b), [])
}

const messageTypes = {
  HELLO: 4
}

// function broadcastAddress (int = 'en0', address) {
//   if (!hasInterface(allInterfaces, int)) {
//     throw new Error(`Unknown network interface (${int}).`)
//   }

//   // if an address is given, look it up under the given network interface
//   // otherwise just get the first IPv4 occurence for that network interface
//   if (address) {
//     addr_info = allInterfaces[int].find(e => e.address === address)
//   } else {
//     addr_info = allInterfaces[int].find(e => e.family === 'IPv4')
//   }

//   if (!addr_info) {
//     throw new Error('No address info found. Specify a valid address.')
//   }

//   // bitwise OR over the splitted NAND netmask, then glue them back together with a dot character to form an ip
//   // we have to do a NAND operation because of the 2-complements; getting rid of all the 'prepended' 1's with & 0xFF
//   return addr_splitted.map((e, i) => (~netmask_splitted[i] & 0xFF) | e).join('.')
// }

const createDiscoveryService = (adapter, options) => {
  const codec = Codec(options)
  const bus = new EventEmitter()
  const servers = []
  const ips = getIPs()
  const MESSAGE_TYPE_LENGHT = 1

  const startServer = (host, port, multicastAddress) => {
    return new Promise((resolve, reject) => {
      try {
        const socket = dgram.createSocket({ type: options.discovery.type, reuseAddr: true })

        socket.on('message', (message, info) => {
          const messageType = Buffer.prototype.readUInt8.call(message, 0)
          const payload = message.slice(MESSAGE_TYPE_LENGHT)

          switch (messageType) {
          case messageTypes.HELLO:
            onMessage(payload, info)
            break
          default:
            onUnknown(payload, info)
          }
        })

        socket.bind({ port, host, exclusive: true }, () => {
          socket.setMulticastInterface(host)
          socket.addMembership(multicastAddress, host)
          socket.setMulticastTTL(1)
          socket.destinatins = [multicastAddress]
          adapter.log.info(`listening to ${host}:${port}`)
        })

        servers.push(socket)

        resolve(socket)
      } catch (error) {
        reject(error)
      }
    })
  }

  const onMessage = (buffer, info) => {
    const message = codec.decode(buffer)
    message.host = info.address
    bus.emit('message', message)
  }

  const onUnknown = (message, info) => {
    adapter.log.debug(`Received an unknown data package from host "${info.address}"`)
  }

  function sendMessage (payload) {
    const header = new Buffer(MESSAGE_TYPE_LENGHT)
    Buffer.prototype.writeUInt8.call(header, messageTypes.HELLO, 0)

    const message = Buffer.concat([header, codec.encode(payload)])

    servers.forEach(server => {
      server.destinatins.forEach(host => {
        server.send(message, options.discovery.port, host, (error) => {
          if (!error) {
            adapter.log.debug(`Message sent to ${host}:${options.discovery.port}`)
          }
        })
      })
    })
  }

  return {
    bus,
    init () {
      if (!options.discovery.enabled) {
        return Promise.resolve()
      }

      return Promise.resolve()
        .then(() => {
          return Promise.all(ips.map(ip => startServer(ip, options.discovery.port, options.discovery.multicastAddress)))
            .then(() => {
              setInterval(() => sendMessage({
                namespace: adapter.broker.options.namespace,
                nodeId: adapter.broker.nodeId,
                port: options.port
              }), 2000)
            })
        })
    }
  }
}

module.exports = createDiscoveryService
