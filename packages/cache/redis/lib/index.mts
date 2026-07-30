/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import Redis, { type RedisOptions } from "ioredis";
import { createCacheBase } from "@weave-js/core/lib/cache/adapters/base.mts";
import type { Logger, Runtime } from "@weave-js/core/types/index.js";

export interface RedisCacheAdapterOptions extends RedisOptions {
  port?: number;
  host?: string;
}

export interface RedisCacheOptions {
  /** Time to live in milliseconds - `null` keeps entries forever. */
  ttl?: number | null;
  [key: string]: unknown;
}

/**
 * The cache instance returned by the factory.
 *
 * The base of the core types the store methods as synchronous placeholders -
 * this interface states what the Redis implementation actually provides.
 */
export interface RedisCache {
  name: string;
  isConnected: boolean;
  options: RedisCacheOptions;
  adapterOptions: RedisCacheAdapterOptions;
  log: Logger;
  init(): void;
  set(hashKey: string, data: unknown, ttl?: number | null): Promise<string>;
  get(cacheKey: string): Promise<unknown>;
  remove(hashKey: string): Promise<void>;
  clear(pattern?: string): Promise<void>;
  stop(): Promise<void>;
  getCachingKey(actionName: string, data: unknown, metadata: object, keys?: string[]): string;
}

const defaultAdapterOptions: RedisCacheAdapterOptions = {
  port: 6379,
  host: "127.0.0.1",
};

/**
 * Creates a Redis cache adapter factory.
 */
export const createRedisCache =
  (adapterOptions: RedisCacheAdapterOptions = {}) =>
  (runtime: Runtime, options: RedisCacheOptions = {}): RedisCache => {
    const resolvedAdapterOptions = { ...defaultAdapterOptions, ...adapterOptions };

    const base = createCacheBase("Redis", runtime, resolvedAdapterOptions, options);

    let client: Redis | undefined;

    /**
     * Returns the client or fails if the cache was not initialized.
     */
    const getClient = (): Redis => {
      if (!client) {
        throw new Error("Redis cache is not initialized.");
      }

      return client;
    };

    const cache = Object.assign(base, {
      init() {
        client = new Redis(resolvedAdapterOptions);

        client.on("connect", () => {
          cache.isConnected = true;
          base.log.info("Redis cacher connected.");
        });

        client.on("error", (error: Error) => {
          cache.isConnected = false;
          base.log.error(`Redis cache error: ${error.message}`);
        });

        client.on("close", () => {
          cache.isConnected = false;
          base.log.warn("Redis cache connection closed.");
        });
      },
      async set(hashKey: string, data: unknown, ttl?: number | null): Promise<string> {
        const serialized = JSON.stringify(data);
        const timeToLive = ttl ?? options.ttl;

        if (timeToLive) {
          await getClient().setex(hashKey, timeToLive / 1000, serialized);
        } else {
          await getClient().set(hashKey, serialized);
        }

        base.log.debug(`Set ${hashKey}`);

        return serialized;
      },
      async get(cacheKey: string): Promise<unknown> {
        const data = await getClient().get(cacheKey);

        if (!data) {
          return null;
        }

        base.log.debug(`FOUND ${cacheKey}`);

        try {
          return JSON.parse(data);
        } catch (error) {
          base.log.error(`Redis result parse error: ${(error as Error).message}`, data);
          return null;
        }
      },
      async remove(hashKey: string): Promise<void> {
        await getClient().del(hashKey);
        base.log.debug(`Delete ${hashKey}`);
      },
      clear(pattern = "*"): Promise<void> {
        return new Promise((resolve, reject) => {
          const stream = getClient().scanStream({ match: pattern });
          const pending: Array<Promise<unknown>> = [];

          stream.on("data", (keys: string[]) => {
            if (!keys.length) {
              return;
            }

            const pipeline = getClient().pipeline();

            keys.forEach((key) => pipeline.del(key));
            pending.push(pipeline.exec());
          });

          stream.on("end", () => {
            // Wait for the deletions of all scanned batches before resolving.
            Promise.all(pending)
              .then(() => {
                base.log.debug("Cache cleared");
                resolve();
              })
              .catch((error: Error) => {
                base.log.error(`Error clearing cache: ${error.message}`);
                reject(error);
              });
          });

          stream.on("error", (error: Error) => {
            base.log.error(`Error clearing cache: ${error.message}`);
            reject(error);
          });
        });
      },
      async stop(): Promise<void> {
        if (!client) {
          return;
        }

        const openClient = client;
        client = undefined;

        await openClient.quit();
      },
    });

    runtime.bus.on("$transport.connected", () => cache.clear());

    return cache as unknown as RedisCache;
  };

export default createRedisCache;
