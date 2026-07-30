import { defaultsDeep } from "@weave-js/utils";
import { BaseTransportAdapter } from "../adapterBase.mts";
import Swim from "./discovery/index.mts";
import * as MessageTypes from "../../messageTypes.mts";
import TCPReader from "./tcpReader.mts";
import TCPWriter from "./tcpWriter.mts";
import { createMessage } from "../../createMessage.mts";

const defaultOptions = {
  port: null,
  discovery: {
    enabled: true,
    type: "udp4",
    udpMulticast: true,
    multicastAddress: "239.0.0.0",
    port: 54355,
    udpReuseAddress: true,
  },
  gossipTimerInterval: 2000,
  maxPacketSize: 1024 * 1024 * 50,
};

/**
 * TCP/SWIM transport adapter for distributed communication
 */
class TCPTransportAdapter extends BaseTransportAdapter {
  #tcpReader: any;
  #tcpWriter: any;
  #gossipTimer: any;
  #swim: any;
  #options: any;

  constructor(adapterOptions: any = {}) {
    super();
    this.name = "TCP";
    this.#options = defaultsDeep(adapterOptions, defaultOptions);
  }

  protected async afterInit(): Promise<void> {
    this.#swim = Swim(this as any, this.#options);
  }

  async connect(): Promise<void> {
    const port = await this.#startTCPServer();

    await this.#startDiscoveryServer(port);
    await this.#startTimers();

    this.log.info("TCP transport adapter started.");

    this.broker.registry.nodeCollection.localNode.port = port;
    this.broker.registry.generateLocalNodeInfo();

    this.connected({
      wasReconnect: false,
      useHeartbeatTimer: false,
      useRemoteNodeCheckTimer: false,
      useOfflineCheckTimer: true,
    });
  }

  async send(message: any): Promise<void> {
    if (
      !message.targetNodeId ||
      ![
        MessageTypes.MESSAGE_PING,
        MessageTypes.MESSAGE_PONG,
        MessageTypes.MESSAGE_EVENT,
        MessageTypes.MESSAGE_REQUEST,
        MessageTypes.MESSAGE_RESPONSE,
        MessageTypes.MESSAGE_GOSSIP_HELLO,
        MessageTypes.MESSAGE_GOSSIP_REQUEST,
        MessageTypes.MESSAGE_GOSSIP_RESPONSE,
        MessageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE,
        MessageTypes.MESSAGE_RESPONSE_STREAM_RESUME,
        MessageTypes.MESSAGE_REQUEST_STREAM_BACKPRESSURE,
        MessageTypes.MESSAGE_REQUEST_STREAM_RESUME,
      ].includes(message.type)
    ) {
      if (message.type === MessageTypes.MESSAGE_DISCONNECT) {
        // send a disconnect message to all connected nodes
        return this.#publishNodeDisconnect(message);
      }
      return;
    }

    const data = this.serialize(message);
    return this.#tcpWriter.send(message.targetNodeId, message.type, data);
  }

  sendHello(nodeId: string): Promise<void> {
    const node = this.broker.registry.nodeCollection.get(nodeId);

    if (!node) {
      return Promise.reject(new Error("Node not found."));
    }

    const localNode = this.broker.registry.nodeCollection.localNode;

    const message = createMessage(MessageTypes.MESSAGE_GOSSIP_HELLO, nodeId, {
      host: localNode.IPList[0],
      port: localNode.port,
    });

    this.send(message);

    return Promise.resolve();
  }

  async close(): Promise<void> {
    clearInterval(this.#gossipTimer);
    if (this.#tcpReader) {
      this.#tcpReader.close();
    }
    if (this.#tcpWriter) {
      this.#tcpWriter.close();
    }

    this.#swim.close();
  }

  // Send a disconnect message to all connected nodes.
  async #publishNodeDisconnect(message: any): Promise<void> {
    const nodes = this.broker.registry.nodeCollection.toArray();
    await Promise.all(
      nodes
        .filter((node: any) => node.isAvailable && !node.isLocal)
        .map((node: any) => {
          const data = this.serialize(message);
          return this.#tcpWriter.send(node.id, message.type, data);
        }),
    );
  }

  #addDiscoveredNode(nodeId: string, host: string, port: number): any {
    const node = this.broker.registry.nodeCollection.createNode(nodeId);

    node.isLocal = false;
    node.isAvailable = false;
    node.IPList = [host];
    node.hostname = host;
    node.port = port;
    node.sequence = 0;
    node.offlineTime = Date.now();
    this.broker.registry.nodeCollection.add(node.id, node);

    return node;
  }

  onIncomingMessage(type: string, data: any, socket: any): void {
    switch (type) {
      case MessageTypes.MESSAGE_GOSSIP_HELLO:
        return this.#onGossipHelloMessage(data, socket);
      case MessageTypes.MESSAGE_GOSSIP_REQUEST:
        return this.#onGossipRequestMessage(data, socket);
      case MessageTypes.MESSAGE_GOSSIP_RESPONSE:
        return this.#onGossipResponseMessage(data, socket);
      default:
        return this.incomingMessage(type, data);
    }
  }

  #startDiscoveryServer(port: number): void {
    this.#swim.bus.on("message", ({ nodeId, host, port }: any) => {
      if (nodeId && nodeId !== this.broker.nodeId) {
        let node = this.broker.registry.nodeCollection.get(nodeId);
        if (!node) {
          this.log.debug(`Discoverd a new node ${nodeId}`);

          node = this.#addDiscoveredNode(nodeId, host, port);
        } else if (!node.isAvailable) {
          // update tcp port
          node.port = port;
          this.log.debug(`Node is still not available: ${node.id}`);
        }
      }
    });

    this.#swim.start(port);
  }

  #startTCPServer(): Promise<number> {
    this.#tcpReader = TCPReader(this as any, this.#options);
    this.#tcpWriter = TCPWriter(this as any);

    this.#tcpReader.on("message", this.#onMessage.bind(this));

    this.#tcpWriter.on("error", (error: any, nodeId: string) => {
      this.log.debug("TCP client error on ", error);
      this.broker.registry.nodeDisconnected(nodeId, false);
    });

    this.#tcpWriter.on("end", (nodeId: string) => {
      this.log.debug("TCP connection ended with");
      this.broker.registry.nodeDisconnected(nodeId, false);
    });

    return this.#tcpReader.listen();
  }

  #startTimers(): void {
    this.#gossipTimer = setInterval(
      () => this.#sendGossipRequest(),
      this.#options.gossipTimerInterval,
    );
    this.#gossipTimer.unref();
  }

  #sendGossipRequest(): void {
    const list = this.broker.registry.nodeCollection.toArray();
    if (!list || list.length === 0) {
      return;
    }

    const payload: any = {
      online: {},
      offline: {},
    };

    const onlineNodes: any[] = [];
    const offlineNodes: any[] = [];

    list.forEach((node: any) => {
      if (node.isAvailable) {
        payload.online[node.id] = [node.sequence, node.cpuSequence || 0, node.cpu || 0];

        if (!node.isLocal) {
          onlineNodes.push(node);
        }
      } else {
        if (node.sequence > 0) {
          payload.offline[node.id] = node.sequence;
        }
        offlineNodes.push(node);
      }
    });

    if (Object.keys(payload.online).length === 0) {
      delete payload.online;
    }

    if (Object.keys(payload.offline).length === 0) {
      delete payload.offline;
    }

    if (onlineNodes.length > 0) {
      this.#sendGossipRequestToRandomEndpoint(payload, onlineNodes);
    }

    if (offlineNodes.length > 0) {
      this.#sendGossipRequestToRandomEndpoint(payload, offlineNodes);
    }
  }

  #sendGossipRequestToRandomEndpoint(payload: any, nodes: any[]): void {
    if (!nodes || nodes.length === 0) {
      return;
    }

    const destinationNode = nodes[Math.floor(Math.random() * nodes.length)];
    if (destinationNode) {
      const message = createMessage(
        MessageTypes.MESSAGE_GOSSIP_REQUEST,
        destinationNode.id,
        payload,
      );

      this.send(message).catch(() => {
        this.log.debug(`Unable to send gossip response to ${destinationNode.id}`);
      });
    }
  }

  #onGossipHelloMessage(packet: any, _socket: any): void {
    try {
      const message = this.deserialize(packet);
      if (!message) {
        this.log.error("Invalid gossip hello message: failed to deserialize");
        return;
      }
      const payload = message.payload;
      const nodeId = payload.sender;
      if (!nodeId) {
        this.log.error("Invalid gossip hello message: missing sender");
        return;
      }
      const node = this.broker.registry.nodeCollection.get(nodeId);

      if (!node) {
        this.#addDiscoveredNode(nodeId, payload.host, payload.port);
      }
    } catch (error: any) {
      this.log.error("Invalid gossip hello message.", error.message);
    }
  }

  // Handle incoming gossip request
  #onGossipRequestMessage(data: any, _socket?: any): void {
    try {
      const message = this.deserialize(data);
      if (!message) {
        this.log.error("Invalid gossip request message: failed to deserialize");
        return;
      }
      const payload = message.payload;
      const list = this.broker.registry.nodeCollection.toArray();

      // Init gossip response
      const response: any = {
        online: {},
        offline: {},
      };

      list.forEach((node: any) => {
        const online = payload.online ? payload.online[node.id] : null;
        const offline = payload.offline ? payload.offline[node.id] : null;

        let sequence: number | undefined;
        let cpuSequence: number | undefined;
        let cpu: number | undefined;

        if (offline) {
          sequence = offline;
        } else if (online) {
          [sequence, cpuSequence, cpu] = online;
        }

        // Local node information are newer
        if (sequence === undefined || sequence < node.sequence) {
          // our node info is newer than the
          if (node.isAvailable) {
            const nodeInfo = this.broker.registry.getNodeInfo(node.id);
            response.online[node.id] = [nodeInfo, node.cpuSequence || 0, node.cpu || 0];
          } else {
            response.offline[node.id] = node.sequence;
          }
          return;
        }

        // sender said node is offline
        if (offline) {
          // our node knows, the node is offline
          if (!node.isAvailable) {
            // we know node is offline
            if (sequence > node.sequence) {
              node.sequence = sequence;
            }
            return;
          } else if (!node.isLocal) {
            // we know, the node is offline
            this.broker.registry.nodeCollection.disconnected(node.id, false);
            node.sequence = sequence;
          } else if (node.isLocal) {
            // Remote node said we are offline, but we are online and send back our node information.
            node.sequence = sequence + 1;
            const nodeInfo = this.broker.registry.getLocalNodeInfo(true);
            response.online[node.id] = [nodeInfo, node.cpuSequence || 0, node.cpu || 0];
          }
        } else if (online) {
          // Remote node said we are online
          if (node.isAvailable) {
            if (cpuSequence !== undefined && cpuSequence > node.cpuSequence) {
              node.heartbeat({
                cpu,
                cpuSequence,
              });
            } else if (cpuSequence !== undefined && cpuSequence < node.cpuSequence) {
              response.online[node.id] = [node.cpuSequence || 0, node.cpu || 0];
            }
          } else {
            return;
          }
        }
      });

      if (Object.keys(response.online).length === 0) {
        delete response.online;
      }

      if (Object.keys(response.offline).length === 0) {
        delete response.offline;
      }

      if (response.online || response.offline) {
        if (!payload.sender) {
          return;
        }
        const destinationNode = this.broker.registry.nodeCollection.get(payload.sender);
        if (destinationNode) {
          const message = createMessage(
            MessageTypes.MESSAGE_GOSSIP_RESPONSE,
            destinationNode.id,
            response,
          );
          this.send(message).catch(() => {});
        }
      }
    } catch (error: unknown) {
      this.log.error((error as Error).message || String(error));
    }
  }

  // Handle incoming gossip response
  #onGossipResponseMessage(data: any, _socket: any): void {
    try {
      const message = this.deserialize(data);
      if (!message) {
        this.log.error("Invalid gossip response message: failed to deserialize");
        return;
      }
      const payload = message.payload;

      // Process online nodes
      if (payload.online) {
        Object.keys(payload.online).forEach((nodeId) => {
          if (nodeId === this.broker.nodeId) {
            return;
          }

          const item = payload.online[nodeId];

          if (!Array.isArray(item)) {
            return;
          }

          let info: any;
          let cpuSequence: number | undefined;
          let cpu: number | undefined;

          if (item.length === 1) {
            [info] = item;
          } else if (item.length === 2) {
            [cpuSequence, cpu] = item;
          } else if (item.length === 3) {
            [info, cpuSequence, cpu] = item;
          }

          const node = this.broker.registry.nodeCollection.get(nodeId);

          if (info && (!node || node.sequence < info.sequence)) {
            // if node is a new node or has a higher sequence update local info.
            info.sender = nodeId;
            this.broker.registry.processNodeInfo(info);
          }

          if (
            node &&
            node.isAvailable &&
            cpuSequence !== undefined &&
            cpuSequence > (node.cpuSequence || 0)
          ) {
            node.heartbeat({
              cpu,
              cpuSequence,
            });
          }
        });
      }

      // Offline nodes
      if (payload.offline) {
        Object.keys(payload.offline).forEach((nodeId) => {
          if (nodeId === this.broker.nodeId) return;

          const sequence = payload.offline[nodeId];
          const node = this.broker.registry.nodeCollection.get(nodeId);

          if (!node) {
            return;
          }

          // the remote node is newer
          if (sequence > node.sequence) {
            if (node.isAvailable) {
              this.broker.registry.nodeCollection.disconnected(node.id, false);
            }
            node.sequence = sequence;
          }
        });
      }
    } catch (error: unknown) {
      this.log.error((error as Error).message || String(error));
    }
  }

  #onMessage(type: string, data: any, socket: any): void {
    try {
      this.onIncomingMessage(type, data, socket);
    } catch (error) {
      console.log(error);
    }
  }
}

/**
 * Factory function for creating TCP adapter instances
 * Maintains backward compatibility with existing code
 */
export default function createTCPAdapter(adapterOptions?: any): TCPTransportAdapter {
  return new TCPTransportAdapter(adapterOptions);
}
