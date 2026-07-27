/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import {
  connect,
  DebugEvents,
  Events,
  type ConnectionOptions,
  type Msg,
  type NatsConnection,
  type Subscription,
} from "nats";
import { BaseTransportAdapter } from "@weave-js/core/lib/transport/adapters/adapterBase.mts";
import type { TransportMessage } from "@weave-js/core/types/index.js";

/**
 * NATS adapter options.
 *
 * Accepts all connection options of the NATS client (v2). The legacy `url`
 * option of the v1 client is still supported and mapped to `servers`.
 */
export interface NATSAdapterOptions extends ConnectionOptions {
  /** @deprecated Use `servers` instead - kept for backward compatibility. */
  url?: string;
}

const DEFAULT_SERVER = "nats://localhost:4222";

/**
 * Converts the legacy `url` option to the `servers` option of the NATS v2 client
 * and applies the default server if none is configured.
 *
 * `servers` is intentionally not deep merged - it may be a string or an array of
 * strings, and merging both shapes would corrupt the value.
 */
const normalizeOptions = (options: NATSAdapterOptions): ConnectionOptions => {
  const { url, ...connectionOptions } = options;

  return {
    ...connectionOptions,
    servers: url ?? connectionOptions.servers ?? DEFAULT_SERVER,
  };
};

/**
 * NATS transport adapter
 */
export class NATSTransportAdapter extends BaseTransportAdapter {
  #connection?: NatsConnection;
  #subscriptions: Subscription[] = [];
  #options: ConnectionOptions;

  constructor(adapterOptions: NATSAdapterOptions | string = {}) {
    super();
    this.name = "NATS";

    const options = typeof adapterOptions === "string" ? { url: adapterOptions } : adapterOptions;

    this.#options = normalizeOptions(options);
  }

  async connect(): Promise<void> {
    this.#connection = await connect(this.#options);

    this.log.info("NATS client connected.");
    this.isConnected = true;

    // The status iterator replaces the event emitter API of the NATS v1 client.
    void this.#watchStatus(this.#connection);

    this.connected();
  }

  async subscribe(type: string, nodeId?: string): Promise<void> {
    if (!this.#connection) {
      return;
    }

    const topic = this.getTopic(type, nodeId);

    const subscription = this.#connection.subscribe(topic, {
      callback: (error: Error | null, message: Msg) => {
        if (error) {
          this.log.error(`NATS subscription error on topic "${topic}": ${error.message}`);
          return;
        }

        this.incomingMessage(type, Buffer.from(message.data));
      },
    });

    this.#subscriptions.push(subscription);
  }

  async send(message: TransportMessage): Promise<void> {
    if (!this.#connection || !this.isConnected) {
      return;
    }

    const data = this.serialize(message);
    this.updateStatisticSent(data.length);

    const topic = this.getTopic(message.type, message.targetNodeId);
    this.#connection.publish(topic, data);
  }

  async close(): Promise<void> {
    if (!this.#connection) {
      return;
    }

    const connection = this.#connection;

    this.#connection = undefined;
    this.#subscriptions = [];
    this.isConnected = false;

    if (connection.isClosed()) {
      return;
    }

    // Drain flushes all pending messages and closes the connection afterwards.
    await connection.drain();
  }

  /**
   * Translates the NATS status stream into the adapter lifecycle hooks.
   */
  async #watchStatus(connection: NatsConnection): Promise<void> {
    for await (const status of connection.status()) {
      switch (status.type) {
        case Events.Disconnect: {
          if (this.isConnected) {
            this.isConnected = false;
            this.interruptionCount++;
            this.log.warn("NATS client disconnected.");
            this.disconnected();
          }
          break;
        }
        case DebugEvents.Reconnecting: {
          this.log.warn("NATS client is reconnecting...");
          break;
        }
        case Events.Reconnect: {
          if (!this.isConnected) {
            this.isConnected = true;
            this.log.info("NATS client reconnected.");
            this.connected({ wasReconnect: true });
          }
          break;
        }
        case Events.Error: {
          this.log.error(`NATS error ${String(status.data)}`);
          break;
        }
      }
    }
  }
}

/**
 * Factory function for creating NATS adapter instances.
 * Maintains backward compatibility with existing code.
 */
export default function createNATSAdapter(
  adapterOptions?: NATSAdapterOptions | string,
): NATSTransportAdapter {
  return new NATSTransportAdapter(adapterOptions);
}
