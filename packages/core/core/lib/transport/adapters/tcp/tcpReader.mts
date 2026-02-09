import net, { Server, Socket } from "net";
import type { AddressInfo } from "net";
import { EventEmitter } from "events";
import TCPWriteStream from "./tcpWriteStream.mts";
import type { TransportAdapter } from "../../../../types/index.js";

interface TCPReaderOptions {
  maxPacketSize: number;
  port?: number;
}

interface TCPReader extends EventEmitter {
  isConnected: boolean;
  listen(): Promise<number>;
  close(): void;
}

export default (adapter: TransportAdapter, options: TCPReaderOptions): TCPReader => {
  const self = Object.assign(new EventEmitter(), {
    isConnected: false,
  }) as TCPReader;

  let sockets: Socket[] = [];
  let server: Server | null = null;

  self.listen = (): Promise<number> => {
    return new Promise((resolve, reject) => {
      server = net.createServer((socket: Socket) => onTCPClientConnected(socket));

      server.on("error", (error: Error) => {
        adapter.log?.error("TCP server error", error.message);
        reject(error);
      });

      server.listen(options, () => {
        const address = server?.address() as AddressInfo;
        const port = address.port;
        self.isConnected = true;
        adapter.log?.info(`TCP server is listening on port ${port}`);
        resolve(port);
      });
    });
  };

  self.close = (): void => {
    if (server && self.isConnected) {
      server.close();
      sockets.forEach((socket) => socket.destroy());
      sockets = [];
    }
  };

  function onTCPClientConnected(socket: Socket): void {
    sockets.push(socket);

    const parser = new TCPWriteStream(adapter, socket, options.maxPacketSize);
    socket.pipe(parser);

    parser.on("error", (error: Error) => {
      adapter.log?.warn("Packet parser error!", error.message);
      closeSocket(socket);
    });

    parser.on("data", (type: string, message: any) => {
      self.emit("message", type, message);
    });

    socket.on("error", (error: Error) => {
      adapter.log?.warn("TCP connection error!", error.message);
      closeSocket(socket);
    });

    socket.on("close", (_isError: boolean) => {
      closeSocket(socket);
    });
  }

  function closeSocket(socket: Socket): void {
    socket.destroy();
    sockets.splice(sockets.indexOf(socket), 1);
  }

  return self;
};
