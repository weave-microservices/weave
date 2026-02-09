import net, { Socket } from "net";
import { EventEmitter } from "events";
import * as MessageTypes from "../../messageTypes.mts";
import TCPMessageTypeHelper from "./tcp-messagetypes.mts";
import type { TransportAdapter } from "../../../../types/index.js";

interface TCPMessageTypeHelperInstance {
  getTypeByIndex(index: number): string | undefined;
  getIndexByType(type: string): number;
}

interface ExtendedSocket extends Socket {
  nodeId?: string;
  lastUsage?: number;
}

interface TCPWriter extends EventEmitter {
  send(nodeId: string, type: string, data: Buffer): Promise<void>;
  close(): void;
}

interface TCPAdapterWithSendHello extends TransportAdapter {
  sendHello(nodeId: string): Promise<void>;
}

export default (adapter: TCPAdapterWithSendHello): TCPWriter => {
  const self = Object.assign(new EventEmitter(), {}) as TCPWriter;
  const sockets = new Map<string, ExtendedSocket>();
  const messageTypeHelper: TCPMessageTypeHelperInstance = TCPMessageTypeHelper(MessageTypes);
  const headerSize = 6;

  const connect = (nodeId: string): Promise<ExtendedSocket> => {
    const node = adapter.broker?.registry.nodeCollection.get(nodeId);
    if (!node) {
      return Promise.reject(new Error(`Missing node info for '${nodeId}'!`));
    }

    const host = node.IPList[0];
    const port = node.port;

    if (port === undefined) {
      return Promise.reject(new Error(`Missing port for node '${nodeId}'!`));
    }

    return new Promise((resolve, reject) => {
      try {
        const socket: ExtendedSocket = net.connect({ host, port }, () => {
          // send hello
          socket.setNoDelay(true);
          socket.nodeId = nodeId;
          socket.lastUsage = Date.now();

          addSocket(nodeId, socket, true);

          adapter
            .sendHello(nodeId)
            .then(() => resolve(socket))
            .catch((error: Error) => reject(error));
        });

        socket.on("error", (error: Error) => {
          removeSocket(nodeId);

          self.emit("error", error, nodeId);

          if (error) {
            reject(error);
          }
        });

        socket.unref();
      } catch (error) {
        if (error) {
          reject(error);
        }
      }
    });
  };

  const addSocket = (nodeId: string, socket: ExtendedSocket, force: boolean): void => {
    const s = sockets.get(nodeId);

    if (!force && s && !s.destroyed) {
      return;
    }

    sockets.set(nodeId, socket);
  };

  const removeSocket = (nodeId: string): void => {
    const socket = sockets.get(nodeId);
    if (socket && !socket.destroyed) {
      socket.destroy();
    }

    sockets.delete(nodeId);
  };

  self.send = (nodeId: string, type: string, data: Buffer): Promise<void> => {
    return Promise.resolve()
      .then(() => {
        const socket = sockets.get(nodeId);

        if (socket && !socket.destroyed) {
          return socket;
        }
        return connect(nodeId);
      })
      .then((socket) => {
        return new Promise<void>((resolve, reject) => {
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
          } catch (error) {
            removeSocket(nodeId);
            reject(error);
          }
        });
      });
  };

  self.close = (): void => {
    sockets.forEach((socket) => {
      if (!socket.destroyed) {
        socket.destroy();
      }
      socket.end();
    });
    sockets.clear();
  };

  return self;
};
