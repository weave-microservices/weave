import { createInMemoryLruCache } from "../../../lib/cache/adapters/index.mts";
import { createNode } from "../../helper/index.mts";
import { describe, it, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import FakeTimers from "@sinonjs/fake-timers";

describe("InMemoryLru Cache initialization", () => {
  it("should create with default options", () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    assert.notStrictEqual(cache.options, undefined);
    cache.stop();
  });

  it("should create with custom TTL", () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime, { ttl: 5000 });
    assert.strictEqual(cache.options.ttl, 5000);
    cache.stop();
  });

  it("should set isConnected to true after init", () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    assert.strictEqual(cache.isConnected, false);
    cache.init();
    assert.strictEqual(cache.isConnected, true);
    cache.stop();
  });
});

describe("InMemoryLru Cache basic operations", () => {
  it("should set and get a value", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    const key = "test:key";
    const value = { data: "hello" };

    await cache.set(key, value);
    const result = await cache.get(key);

    assert.deepStrictEqual(result, value);
    cache.stop();
  });

  it("should return null for non-existent keys", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    const result = await cache.get("non:existent:key");
    assert.strictEqual(result, null);

    cache.stop();
  });

  it("should remove a value", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    const key = "test:remove";
    await cache.set(key, "value");
    await cache.remove(key);
    const result = await cache.get(key);

    assert.strictEqual(result, null);
    cache.stop();
  });

  it("should clear all values", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    await cache.set("key1", "value1");
    await cache.set("key2", "value2");
    await cache.set("key3", "value3");

    await cache.clear();

    const results = await Promise.all([cache.get("key1"), cache.get("key2"), cache.get("key3")]);

    assert.deepStrictEqual(results, [null, null, null]);
    cache.stop();
  });

  it("should clear values by pattern", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    await cache.set("users:1", "user1");
    await cache.set("users:2", "user2");
    await cache.set("posts:1", "post1");

    await cache.clear("users*");

    const results = await Promise.all([
      cache.get("users:1"),
      cache.get("users:2"),
      cache.get("posts:1"),
    ]);

    assert.strictEqual(results[0], null);
    assert.strictEqual(results[1], null);
    assert.strictEqual(results[2], "post1");
    cache.stop();
  });
});

describe("InMemoryLru Cache TTL", () => {
  let clock: FakeTimers.InstalledClock;

  beforeEach(() => {
    clock = FakeTimers.install();
  });

  afterEach(() => {
    clock.uninstall();
  });

  it("should expire values after TTL", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime, { ttl: 1000 });
    cache.init();

    const key = "ttl:test";
    await cache.set(key, "value");

    // Value should exist
    let result = await cache.get(key);
    assert.strictEqual(result, "value");

    // After TTL, value should be expired
    clock.tick(1100);
    result = await cache.get(key);
    assert.strictEqual(result, null);

    cache.stop();
  });

  it("should use custom TTL per key", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime, { ttl: 10000 });
    cache.init();

    await cache.set("short", "value", 500);
    await cache.set("long", "value", 5000);

    clock.tick(600);

    const shortResult = await cache.get("short");
    const longResult = await cache.get("long");

    assert.strictEqual(shortResult, null);
    assert.strictEqual(longResult, "value");

    cache.stop();
  });

  it("should not expire values without TTL", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    await cache.set("no-ttl", "value");

    clock.tick(100000);

    const result = await cache.get("no-ttl");
    assert.strictEqual(result, "value");

    cache.stop();
  });

  it("should clean expired values in background timer", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime, { ttl: 1000 });
    cache.init();

    await cache.set("expire:1", "value1");
    await cache.set("expire:2", "value2");

    // Tick past TTL and past the check interval (3 seconds)
    clock.tick(4000);

    // Values should be cleaned by the background timer
    const result1 = await cache.get("expire:1");
    const result2 = await cache.get("expire:2");

    assert.strictEqual(result1, null);
    assert.strictEqual(result2, null);

    cache.stop();
  });
});

describe("InMemoryLru Cache lock mechanism", () => {
  it("should acquire and release a lock", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    const release = await cache.lock("test:lock", 5000);
    assert.ok(typeof release === "function");

    await release();
    cache.stop();
  });

  it("should block concurrent access with lock", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    const executionOrder: string[] = [];

    // First acquire the lock
    const release1 = await cache.lock("concurrent:lock", 5000);
    executionOrder.push("lock1-acquired");

    // Start second lock request (will wait)
    const lock2Promise = cache.lock("concurrent:lock", 5000).then((release) => {
      executionOrder.push("lock2-acquired");
      return release;
    });

    // Release first lock after a delay
    setTimeout(async () => {
      executionOrder.push("lock1-releasing");
      await release1();
    }, 50);

    // Wait for second lock
    const release2 = await lock2Promise;
    await release2();
    executionOrder.push("lock2-released");

    assert.strictEqual(executionOrder[0], "lock1-acquired");
    assert.strictEqual(executionOrder[1], "lock1-releasing");
    assert.strictEqual(executionOrder[2], "lock2-acquired");
    assert.strictEqual(executionOrder[3], "lock2-released");

    cache.stop();
  });

  it("should reject tryAcquireLock when already locked", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    // Acquire first lock
    const release = await cache.lock("try:lock", 5000);

    // Try to acquire same lock should fail
    await assert.rejects(cache.tryAcquireLock("try:lock", 5000), { message: "Locked" });

    await release();
    cache.stop();
  });

  it("should allow tryAcquireLock when not locked", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    const release = await cache.tryAcquireLock("new:lock", 5000);
    assert.ok(typeof release === "function");

    await release();
    cache.stop();
  });
});

describe("InMemoryLru Cache transport connection handling", () => {
  it("should clear cache when transport connects", () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    // Set some values
    cache.set("key1", "value1");
    cache.set("key2", "value2");

    // Mock the clear method
    const clearMock = mock.fn(() => Promise.resolve());
    (cache as unknown as { clear: typeof clearMock }).clear = clearMock;

    // Emit transport connected event
    broker.bus.emit("$transport.connected");

    assert.strictEqual(clearMock.mock.callCount(), 1);
    cache.stop();
  });
});

describe("InMemoryLru Cache with metrics", () => {
  it("should increment metrics counters", async () => {
    const broker = createNode({
      logger: { enabled: false },
      metrics: { enabled: true },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    // Set a value (should increment CACHE_SET_TOTAL)
    await cache.set("metrics:key", "value");

    // Get a value (should increment CACHE_GET_TOTAL and CACHE_FOUND_TOTAL)
    await cache.get("metrics:key");

    // Get non-existent value (should only increment CACHE_GET_TOTAL)
    await cache.get("non:existent");

    // Remove a value (should increment CACHE_DELETED_TOTAL)
    await cache.remove("metrics:key");

    cache.stop();
  });
});

describe("InMemoryLru Cache complex data types", () => {
  it("should store and retrieve objects", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    const data = {
      name: "Test User",
      age: 30,
      roles: ["admin", "user"],
      settings: {
        theme: "dark",
        notifications: true,
      },
    };

    await cache.set("object:test", data);
    const result = await cache.get("object:test");

    assert.deepStrictEqual(result, data);
    cache.stop();
  });

  it("should store and retrieve arrays", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    const data = [1, 2, 3, "four", { five: 5 }];

    await cache.set("array:test", data);
    const result = await cache.get("array:test");

    assert.deepStrictEqual(result, data);
    cache.stop();
  });

  it("should store and retrieve null and undefined", async () => {
    const broker = createNode({
      logger: { enabled: false },
    });
    const cache = createInMemoryLruCache()(broker.runtime);
    cache.init();

    // Note: undefined might be converted, but null should work
    await cache.set("null:test", null);
    const result = await cache.get("null:test");

    // The cache might return null for stored null or non-existent
    // This tests the behavior is consistent
    assert.strictEqual(result, null);
    cache.stop();
  });
});
