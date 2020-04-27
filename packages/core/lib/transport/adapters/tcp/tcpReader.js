const net = require('net')
const { EventEmitter } = require('events')
const TCPWriteStream = require('./tcpWriteStream')

module.exports = (adapter, options) => {
  const self = Object.assign({}, EventEmitter.prototype)
  const sockets = []
  let server

  self.isConnected = false

  self.listen = () => {
    return new Promise((resolve, reject) => {
      server = net.createServer(socket => onTCPClientConnected(socket))

      server.on('error', error => {
        adapter.log.error('TCP server error', error)
        reject(error)
      })

      server.listen(options, () => {
        const port = server.address().port
        self.isConnected = true
        adapter.log.info(`TCP server is listening on port ${port}`)
        resolve(options.port)
      })
    })
  }

  function onTCPClientConnected (socket) {
    sockets.push(socket)

    // const address = socket.remoteAddress
    const parser = new TCPWriteStream(adapter, socket)
    socket.pipe(parser)

    parser.on('data', (type, message) => {
      self.emit('message', type, message)
      // adapter.onIncomingMessage(type, message)
    })
  }

  return self
}
