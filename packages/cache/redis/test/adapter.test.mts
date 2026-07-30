import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { Weave } from "@weave-js/core";
import { installRedisMock, type RedisMock } from "./ioredis-mock.mts";

// The module mock has to be registered before the cache adapter is imported.
const redis = installRedisMock();
let redisMock: RedisMock;

const { createRedisCache } = await import("../lib/index.mts");

const createRuntime = () =>
  Weave({
    logger: {
      enabled: false,
    },
  }).runtime;

/**
 * Creates an initialized cache on a fresh runtime.
 */
const createCache = (
  adapterOptions?: Parameters<typeof createRedisCache>[0],
  options?: Parameters<ReturnType<typeof createRedisCache>>[1],
) => {
  const runtime = createRuntime();
  const cache = createRedisCache(adapterOptions)(runtime, options);

  cache.init();

  return { cache, runtime };
};

describe("Redis cache", () => {
  beforeEach(() => {
    redisMock = redis.reset();
  });

  describe("initialization", () => {
    it("should create with default options", () => {
      const { cache } = createCache();

      assert.ok(cache.options);
      assert.equal(cache.options.ttl, null);
      assert.deepEqual(cache.adapterOptions, { host: "127.0.0.1", port: 6379 });
    });

    it("should create with cache options", () => {
      const { cache } = createCache(undefined, { ttl: 4000 });

      assert.equal(cache.options.ttl, 4000);
      assert.deepEqual(cache.adapterOptions, { host: "127.0.0.1", port: 6379 });
    });

    it("should pass the adapter options to the client", () => {
      createCache({ host: "redis.local", port: 6380, db: 2 });

      assert.deepEqual(redisMock.options, { host: "redis.local", port: 6380, db: 2 });
    });

    it("should fail if it is used before init", async () => {
      const cache = createRedisCache()(createRuntime());

      await assert.rejects(() => cache.get("key"), /not initialized/);
    });
  });

  describe("connection events", () => {
    it("should track the connection state", () => {
      const { cache } = createCache();

      redisMock.emit("connect");
      assert.equal(cache.isConnected, true);

      redisMock.emit("close");
      assert.equal(cache.isConnected, false);
    });

    it("should reset the connection state on an error", () => {
      const { cache } = createCache();

      redisMock.emit("connect");
      redisMock.emit("error", new Error("connection refused"));

      assert.equal(cache.isConnected, false);
    });
  });

  describe("set and get", () => {
    it("should store and read a value", async () => {
      const { cache } = createCache();
      const result = { data: ["Hello", "my", "friend"] };

      await cache.set("key1", result);

      assert.deepEqual(await cache.get("key1"), result);
    });

    it("should overwrite an existing value", async () => {
      const { cache } = createCache();

      await cache.set("key1", { first: true });
      await cache.set("key1", { second: true });

      assert.deepEqual(await cache.get("key1"), { second: true });
    });

    it("should return null for an unknown key", async () => {
      const { cache } = createCache();

      assert.equal(await cache.get("unknown"), null);
    });

    it("should return null for a value that is not valid json", async () => {
      const { cache } = createCache();

      redisMock.store.set("broken", "{not json");

      assert.equal(await cache.get("broken"), null);
    });

    it("should store without an expiry if no ttl is configured", async () => {
      const { cache } = createCache();

      await cache.set("key1", { data: true });

      assert.equal(redisMock.expiries.size, 0);
    });

    it("should use the configured ttl", async () => {
      const { cache } = createCache(undefined, { ttl: 4000 });

      await cache.set("key1", { data: true });

      assert.equal(redisMock.expiries.get("key1"), 4);
    });

    it("should prefer the ttl of the call over the configured one", async () => {
      const { cache } = createCache(undefined, { ttl: 4000 });

      await cache.set("key1", { data: true }, 10000);

      assert.equal(redisMock.expiries.get("key1"), 10);
    });
  });

  describe("remove", () => {
    it("should delete a value by key", async () => {
      const { cache } = createCache();

      await cache.set("key1", { data: true });
      await cache.remove("key1");

      assert.equal(await cache.get("key1"), null);
    });

    it("should ignore an unknown key", async () => {
      const { cache } = createCache();

      await cache.remove("unknown");

      assert.equal(redisMock.store.size, 0);
    });
  });

  describe("clear", () => {
    it("should remove all entries", async () => {
      const { cache } = createCache();

      await cache.set("key1", { data: true });
      await cache.set("key2", { data: true });

      await cache.clear();

      assert.equal(await cache.get("key1"), null);
      assert.equal(await cache.get("key2"), null);
    });

    it("should delete the keys of every scan batch", async () => {
      const { cache } = createCache();

      await cache.set("key1", { data: true });
      await cache.set("key2", { data: true });
      redisMock.scanBatches = [["key1"], ["key2"]];

      await cache.clear();

      assert.deepEqual(
        redisMock.pipelineCommands.map((entry) => entry.key),
        ["key1", "key2"],
      );
      assert.equal(redisMock.store.size, 0);
    });

    it("should ignore empty scan batches", async () => {
      const { cache } = createCache();

      redisMock.scanBatches = [[]];

      await cache.clear();

      assert.deepEqual(redisMock.pipelineCommands, []);
    });

    it("should reject if the scan stream fails", async () => {
      const { cache } = createCache();

      redisMock.scanError = new Error("scan failed");

      await assert.rejects(() => cache.clear(), /scan failed/);
    });

    it("should reject if the deletion fails", async () => {
      const { cache } = createCache();

      await cache.set("key1", { data: true });
      redisMock.pipelineError = new Error("pipeline failed");

      await assert.rejects(() => cache.clear(), /pipeline failed/);
    });

    it("should clear the cache once the transport connects", async () => {
      const { cache, runtime } = createCache();

      await cache.set("key1", { data: true });

      runtime.bus.emit("$transport.connected");

      // the bus handler runs synchronously, the scan stream resolves on the next tick
      await new Promise((resolve) => setImmediate(resolve));
      await new Promise((resolve) => setImmediate(resolve));

      assert.equal(redisMock.store.size, 0);
    });
  });

  describe("stop", () => {
    it("should quit the client", async () => {
      const { cache } = createCache();

      await cache.stop();

      assert.equal(redisMock.quitCalls, 1);
    });

    it("should tolerate being stopped twice", async () => {
      const { cache } = createCache();

      await cache.stop();
      await cache.stop();

      assert.equal(redisMock.quitCalls, 1);
    });
  });
});
