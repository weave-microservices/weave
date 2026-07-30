import dgram, { Socket as DgramSocket } from "dgram";
import type { RemoteInfo } from "dgram";
import { getIpList } from "@weave-js/utils";
import { EventEmitter } from "events";
import Codec from "./codec.mts";
import { getBroadcastAddresses } from "../utils.mts";
import type { TransportAdapter } from "../../../../../types/index.js";

const messageTypes = {
  HELLO: 4,
} as const;

interface DiscoveryOptions {
  discovery: {
    enabled: boolean;
    type: "udp4" | "udp6";
    udpMulticast?: boolean;
    multicastAddress?: string;
    port: number;
    udpReuseAddress?: boolean;
    udpBroadcast?: boolean;
    udpBindAddress?: string;
  };
}

interface DiscoveryMessage {
  namespace: string;
  nodeId: string;
  port: number;
  host?: string;
}

interface DiscoverySocket extends DgramSocket {
  destinations?: string[];
}

interface DiscoveryService {
  bus: EventEmitter;
  start(port: number): Promise<void>;
  close(): void;
}

const createDiscoveryService = (
  adapter: TransportAdapter,
  options: DiscoveryOptions,
): DiscoveryService => {
  const namespace = adapter.broker?.options?.namespace;
  const codec = Codec(options);
  const bus = new EventEmitter();
  const ips: string[] = getIpList(false);
  const MESSAGE_TYPE_LENGTH = 1;

  let servers: DiscoverySocket[] = [];
  let discoverTimer: ReturnType<typeof setInterval> | null = null;

  const startServer = (
    host: string,
    port: number,
    multicastAddress?: string,
  ): Promise<DiscoverySocket> => {
    return new Promise((resolve, reject) => {
      try {
        const socket: DiscoverySocket = dgram.createSocket({
          type: options.discovery.type,
          reuseAddr: options.discovery.udpReuseAddress,
        });

        socket.on("message", onMessage);

        socket.bind({ port, exclusive: true }, () => {
          try {
            if (multicastAddress) {
              socket.setMulticastInterface(host);
              socket.addMembership(multicastAddress, host);
              socket.setMulticastTTL(1);
              // Add destination to socket object
              Object.defineProperty(socket, "destinations", {
                value: [multicastAddress],
              });
              adapter.log?.info(
                `UDP Server is listening on ${host}:${port}. Membership: ${multicastAddress}`,
              );
            } else {
              socket.setBroadcast(true);
              Object.defineProperty(socket, "destinations", {
                value: getBroadcastAddresses(),
              });
            }
          } catch (error: unknown) {
            adapter.log?.info(`UDP Multicast membership error: ${(error as Error).message}`);
          }
        });

        servers.push(socket);

        resolve(socket);
      } catch (error) {
        reject(error);
      }
    });
  };

  const onMessage = (buffer: Buffer, info: RemoteInfo): void => {
    const messageType = Buffer.prototype.readUInt8.call(buffer, 0);
    const payload = buffer.slice(MESSAGE_TYPE_LENGTH);

    switch (messageType) {
      case messageTypes.HELLO: {
        const message: DiscoveryMessage = codec.decode(payload);
        message.host = info.address;

        if (message.namespace === namespace) {
          bus.emit("message", message);
        }
        break;
      }
      default:
        adapter.log?.debug(`Received an unknown data package from host "${info.address}"`);
    }
  };

  function sendMessage(payload: DiscoveryMessage): void {
    const header = Buffer.alloc(MESSAGE_TYPE_LENGTH);
    Buffer.prototype.writeUInt8.call(header, messageTypes.HELLO, 0);

    const message = Buffer.concat([header, codec.encode(payload)]);

    servers.forEach((server) => {
      server.destinations?.forEach((host: string) => {
        server.send(message, options.discovery.port, host, (error: Error | null) => {
          if (!error) {
            adapter.log?.verbose(`Message sent to ${host}:${options.discovery.port}`);
          }
        });
      });
    });
  }

  function sendDiscoveryPackage(port: number): void {
    sendMessage({
      namespace: adapter.broker?.options?.namespace || "",
      nodeId: adapter.broker?.nodeId || "",
      port: port,
    });
  }

  function startDiscovering(port: number): void {
    discoverTimer = setInterval(() => sendDiscoveryPackage(port), 2000);
    discoverTimer.unref();
  }

  function stopDiscovery(): void {
    if (discoverTimer) {
      clearInterval(discoverTimer);
      discoverTimer = null;
      adapter.log?.info("UDP discovery service stopped");
    }
  }

  return {
    bus,
    async start(port: number): Promise<void> {
      if (!options.discovery.enabled) {
        return Promise.resolve();
      }

      // UDP Multicast
      if (options.discovery.udpMulticast) {
        if (options.discovery.multicastAddress) {
          await Promise.all(
            ips.map((ip) =>
              startServer(ip, options.discovery.port, options.discovery.multicastAddress),
            ),
          );
        }
      }

      // UDP Broadcast
      if (options.discovery.udpBroadcast && options.discovery.udpBindAddress) {
        await startServer(
          options.discovery.udpBindAddress,
          options.discovery.port,
          options.discovery.multicastAddress,
        );
      }

      // send the first dis
      const timeout = Math.floor(Math.random() * 500) + 500;
      setTimeout(() => sendDiscoveryPackage(port), timeout);
      startDiscovering(port);
    },
    close(): void {
      stopDiscovery();
      servers.forEach((server) => server.close());
      servers = [];
    },
  };
};

export default createDiscoveryService;
