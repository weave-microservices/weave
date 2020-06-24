const net = require('net')
const { EventEmitter } = require('events')
const MessageTypes = require('../../message-types')
const TCPMessageTypeHelper = require('./tcp-messagetypes')

module.exports = (adapter, options) => {
  const self = Object.assign({}, EventEmitter.prototype)
  const sockets = new Map()
  const messageTypeHelper = TCPMessageTypeHelper(MessageTypes)
  const headerSize = 6

  const connect = nodeId => {
    const node = adapter.broker.registry.nodes.get(nodeId)
    if (!node) {
      return Promise.reject()
    }

    const host = node.IPList[0]
    const port = node.port

    return new Promise((resolve, reject) => {
      try {
        const socket = net.connect({ host, port }, () => {
          // send hello
          socket.setNoDelay(true)
          socket.nodeId = nodeId
          socket.lastUsage = Date.now()

          addSocket(nodeId, socket, true)

          adapter.sendHello(nodeId)
            .then(() => resolve(socket))
            .catch(error => reject(error))
        })

        socket.on('error', error => {
          removeSocket(nodeId)

          self.emit('error', error, nodeId)

          if (error) {
            reject(error)
          }
        })

        socket.unref()
      } catch (error) {
        if (error) {
          reject(error)
        }
      }
    })
  }

  const addSocket = (nodeId, socket, force) => {
    const s = sockets.get(nodeId)

    if (!force && s && !s.destroyed) {
      return
    }

    sockets.set(nodeId, socket)
  }

  const removeSocket = nodeId => {
    const socket = sockets.get(nodeId)
    if (socket && !socket.destroyed) {
      socket.destroy()
    }

    sockets.delete(nodeId)
  }

  self.send = (nodeId, type, data) => {
    return Promise.resolve()
      .then(() => {
        const socket = sockets.get(nodeId)

        if (socket && !socket.destroyed) {
          return socket
        }
        return connect(nodeId)
      })
      .then(socket => {
        return new Promise((resolve, reject) => {
          const header = Buffer.alloc(headerSize)

          header.writeInt32BE(data.length + headerSize, 1)
          header.writeInt8(messageTypeHelper.getIndexByType(type), 5)

          const crc = header[1] ^ header[2] ^ header[3] ^ header[4] ^ header[5]
          header[0] = crc

          const payload = Buffer.concat([header, data])

          try {
            socket.write(payload, () => {
              resolve()
            })
          } catch (error) {
            removeSocket(nodeId)
            reject(error)
          }
        })
      })
  }

  self.close = () => {
    sockets.forEach(socket => {
      if (!socket.destroyed) {
        socket.destroy()
      }
      socket.end()
    })
    sockets.clear()
  }

  return self
}
