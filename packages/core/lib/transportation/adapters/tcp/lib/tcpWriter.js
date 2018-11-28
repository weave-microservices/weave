const net = require('net')
const { EventEmitter } = require('events')

module.exports = (adapter, options) => {
    const self = Object.assign({}, EventEmitter.prototype)
    const sockets = new Map()
    const headerSize = 6
    const connect = (nodeId) => {
        const node = adapter.registry.nodes.get(nodeId)
        if (!node) {
            return Promise.reject()
        }

        const host = node.IPList[0]
        const port = node.port

        return new Promise((resolve, reject) => {
            const socket = net.connect({ host, port }, () => {
                // send hello

                socket.setNoDelay(true)
                socket.nodeId = adapter.nodeId
                socket.lastUsage = Date.now()
                addSocket(adapter.nodeId, socket, true)

                resolve(socket)
            })
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
                    header.writeInt8(1)
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

    return self
}
