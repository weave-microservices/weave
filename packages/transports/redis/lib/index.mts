/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { createClient, type RedisClientType } from "redis";
import { defaultsDeep, promiseDelay } from "@weave-js/utils";
// @ts-ignore - BaseTransportAdapter is exported but types may not be fully resolved
import { BaseTransportAdapter } from "@weave-js/core/lib/transport/adapters/adapterBase.mts";

/**
 * Redis adapter options (Redis v5 format)
 */
export interface RedisAdapterOptions {
  socket?: {
    port?: number;
    host?: string;
  };
  password?: string;
  database?: number;
  // Legacy options for backward compatibility
  port?: number;
  host?: string;
  db?: number;
  [key: string]: any;
}


const defaultOptions: RedisAdapterOptions = {
  socket: {
    port: 6379,
    host: "127.0.0.1",
  },
};

/**
 * Converts legacy options to Redis v5 format
 */
function normalizeOptions(options: RedisAdapterOptions): any {
  const normalized: any = { ...options };
  
  // Convert legacy format to new socket format
  if (options.port || options.host) {
    normalized.socket = {
      port: options.port || 6379,
      host: options.host || "127.0.0.1",
    };
    delete normalized.port;
    delete normalized.host;
  }
  
  // Convert db to database
  if (options.db !== undefined) {
    normalized.database = options.db;
    delete normalized.db;
  }
  
  return normalized;
}

/**
 * Redis transport adapter class
 * Extends BaseTransportAdapter for full type safety
 */
class RedisTransportAdapter extends BaseTransportAdapter {
  #clientSub!: RedisClientType;
  #clientPub!: RedisClientType;
  #options: any;

  constructor(adapterOptions: RedisAdapterOptions = {}) {
    super();
    this.name = "REDIS";
    
    // Merge and normalize options
    const mergedOptions = defaultsDeep(adapterOptions, defaultOptions);
    this.#options = normalizeOptions(mergedOptions);
  }

  async connect(): Promise<void> {
    try {
      // Create subscriber client
      this.#clientSub = createClient(this.#options);

      // Set up error handlers before connecting
      this.#clientSub.on("error", (error: Error) => {
        this.log.error("Redis SUB error:", error.message);
        this.isConnected = false;
      });

      this.#clientSub.on("end", () => {
        if (this.isConnected) {
          this.isConnected = false;
          this.interruptionCount++;
          this.log.warn("Redis SUB disconnected.");
          this.disconnected();
        }
      });

      // Connect subscriber
      await this.#clientSub.connect();
      this.log.info("Redis SUB client connected.");

      // Create publisher client
      this.#clientPub = createClient(this.#options);

      this.#clientPub.on("error", (error: Error) => {
        this.log.error("Redis PUB error:", error.message);
        this.isConnected = false;
      });

      this.#clientPub.on("end", () => {
        if (this.isConnected) {
          this.isConnected = false;
          this.interruptionCount++;
          this.log.warn("Redis PUB disconnected.");
          this.disconnected();
        }
      });

      // Connect publisher
      await this.#clientPub.connect();
      
      if (this.interruptionCount > 0 && !this.isConnected) {
        this.bus.emit("adapter.connected", true);
      }
      
      this.log.info("Redis PUB client connected.");
      this.isConnected = true;
      
      this.connected();
    } catch (error) {
      this.log.error("Redis connection error:", error);
      throw error;
    }
  }

  async subscribe(type: string, nodeId?: string): Promise<void> {
    const topic = this.getTopic(type, nodeId);
    
    // Subscribe and set up message handler
    await this.#clientSub.subscribe(topic, (message: string) => {
      const messageType = topic.split(".")[1];
      this.incomingMessage(messageType, message);
    });
  }

  async send(message: any): Promise<void> {
    const data = this.serialize(message);
    if (this.isConnected) {
      this.updateStatisticSent(data.length);
      const topic = this.getTopic(message.type, message.targetNodeId);
      await this.#clientPub.publish(topic, data.toString());
    }
  }

  async close(): Promise<void> {
    if (this.#clientPub && this.#clientSub) {
      await Promise.all([
        this.#clientPub.quit(),
        this.#clientSub.quit()
      ]);
    }
    await promiseDelay(Promise.resolve(), 500);
  }
}

/**
 * Factory function for creating Redis adapter instances
 * Maintains backward compatibility with existing code
 */
export default function createRedisAdapter(adapterOptions?: RedisAdapterOptions): RedisTransportAdapter {
  return new RedisTransportAdapter(adapterOptions);
}
