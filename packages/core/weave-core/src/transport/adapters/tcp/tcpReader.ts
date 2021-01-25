import net from 'net'
import { EventEmitter } from 'events'
import { TCPWriteStream } from './tcpWriteStream'
import { TransportAdapter } from '../../../shared/interfaces/transport-adapter.interface'

export interface TCPReader {
  bus: EventEmitter,
  isConnected: boolean,
  listen(): Promise<number>,
  close(): void
}

export function createTCPReader(adapter: TransportAdapter, options): TCPReader {
  const self: TCPReader = Object.create(null)
  let sockets = []
  let server

  self.bus = new EventEmitter()

  self.isConnected = false

  self.listen = () => {
    return new Promise<number>((resolve, reject) => {
      server = net.createServer(socket => onTCPClientConnected(socket))

      server.on('error', error => {
        adapter.log.error('TCP server error', error)
        reject(error)
      })

      server.listen(options, () => {
        const port: number = server.address().port
        self.isConnected = true
        adapter.log.info(`TCP server is listening on port ${port}`)
        resolve(port)
      })
    })
  }

  self.close = () => {
    if (server && self.isConnected) {
      sockets.forEach(socket => socket.destroy())
      sockets = []
    }
  }

  function onTCPClientConnected (socket) {
    sockets.push(socket)

    const parser = new TCPWriteStream(adapter, socket, options.maxPacketSize)
    socket.pipe(parser)

    parser.on('error', error => {
      adapter.log.warn('Packet parser error!', error)
      closeSocket(socket)
    })

    parser.on('data', (type, message) => {
      self.bus.emit('message', type, message)
    })

    socket.on('error', error => {
      adapter.log.warn('TCP connection error!', error)
      closeSocket(socket)
    })

    socket.on('close', (isError) => {
      closeSocket(socket)
    })
  }

  function closeSocket (socket) {
    socket.destroy()
    sockets.splice(sockets.indexOf(socket), 1)
  }

  return self
}
