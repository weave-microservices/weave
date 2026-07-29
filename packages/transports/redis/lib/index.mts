/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { createClient } from "redis";
import { BaseTransportAdapter } from "@weave-js/core/lib/transport/adapters/adapterBase.mts";
import type { TransportMessage } from "@weave-js/core/types/index.js";

type RedisClient = ReturnType<typeof createClient>;
type RedisClientOptions = Parameters<typeof createClient>[0];

/**
 * Redis adapter options (Redis v5 format).
 *
 * The flat options of the Redis v3 client (`host`, `port`, `db`) are still
 * accepted and mapped to their v5 counterparts.
 */
export interface RedisAdapterOptions {
  socket?: {
    port?: number;
    host?: string;
  };
  password?: string;
  database?: number;
  /** @deprecated Use `socket.port` instead - kept for backward compatibility. */
  port?: number;
  /** @deprecated Use `socket.host` instead - kept for backward compatibility. */
  host?: string;
  /** @deprecated Use `database` instead - kept for backward compatibility. */
  db?: number;
  [key: string]: unknown;
}

const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 6379;

/**
 * Converts the legacy options of the Redis v3 client to the v5 format and
 * applies the default socket if none is configured.
 */
const normalizeOptions = (options: RedisAdapterOptions): RedisClientOptions => {
  const { host, port, db, socket, ...clientOptions } = options;

  const normalized: RedisAdapterOptions = {
    ...clientOptions,
    socket: {
      ...socket,
      host: host ?? socket?.host ?? DEFAULT_HOST,
      port: port ?? socket?.port ?? DEFAULT_PORT,
    },
  };

  if (db !== undefined) {
    normalized.database = db;
  }

  return normalized as RedisClientOptions;
};

/**
 * Redis transport adapter
 */
export class RedisTransportAdapter extends BaseTransportAdapter {
  #clientSub?: RedisClient;
  #clientPub?: RedisClient;
  #options: RedisClientOptions;

  constructor(adapterOptions: RedisAdapterOptions = {}) {
    super();
    this.name = "REDIS";

    this.#options = normalizeOptions(adapterOptions);
  }

  async connect(): Promise<void> {
    try {
      this.#clientSub = this.#createClient("SUB");
      await this.#clientSub.connect();
      this.log.info("Redis SUB client connected.");

      this.#clientPub = this.#createClient("PUB");
      await this.#clientPub.connect();
      this.log.info("Redis PUB client connected.");

      this.isConnected = true;

      this.connected({ wasReconnect: this.interruptionCount > 0 });
    } catch (error) {
      this.log.error(`Redis connection error: ${(error as Error).message}`);
      throw error;
    }
  }

  async subscribe(type: string, nodeId?: string): Promise<void> {
    if (!this.#clientSub) {
      return;
    }

    const topic = this.getTopic(type, nodeId);

    await this.#clientSub.subscribe(topic, (message: string) => {
      this.incomingMessage(type, message);
    });
  }

  async send(message: TransportMessage): Promise<void> {
    if (!this.#clientPub || !this.isConnected) {
      return;
    }

    const data = this.serialize(message);
    this.updateStatisticSent(data.length);

    const topic = this.getTopic(message.type, message.targetNodeId);
    await this.#clientPub.publish(topic, data.toString());
  }

  async close(): Promise<void> {
    const clients = [this.#clientPub, this.#clientSub].filter(
      (client): client is RedisClient => Boolean(client),
    );

    this.#clientPub = undefined;
    this.#clientSub = undefined;
    this.isConnected = false;

    await Promise.all(clients.filter((client) => client.isOpen).map((client) => client.close()));
  }

  /**
   * Creates a client and wires its events to the adapter lifecycle hooks.
   */
  #createClient(label: string): RedisClient {
    const client = createClient(this.#options);

    client.on("error", (error: Error) => {
      this.log.error(`Redis ${label} error: ${error.message}`);
    });

    client.on("end", () => {
      if (this.isConnected) {
        this.isConnected = false;
        this.interruptionCount++;
        this.log.warn(`Redis ${label} disconnected.`);
        this.disconnected();
      }
    });

    client.on("reconnecting", () => {
      this.log.warn(`Redis ${label} client is reconnecting...`);
    });

    client.on("ready", () => {
      // Only relevant after an interruption - the initial connect is handled
      // by connect() itself.
      if (this.isConnected || this.interruptionCount === 0) {
        return;
      }

      if (this.#clientSub?.isReady && this.#clientPub?.isReady) {
        this.isConnected = true;
        this.log.info("Redis clients reconnected.");
        this.connected({ wasReconnect: true });
      }
    });

    return client;
  }
}

/**
 * Factory function for creating Redis adapter instances.
 * Maintains backward compatibility with existing code.
 */
export default function createRedisAdapter(
  adapterOptions?: RedisAdapterOptions,
): RedisTransportAdapter {
  return new RedisTransportAdapter(adapterOptions);
}
