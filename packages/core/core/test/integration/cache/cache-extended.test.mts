import FakeTimers from "@sinonjs/fake-timers";
import { createNode } from "../../helper/index.mts";
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { Broker, Context } from "../../../types/index.js";

describe("Cache $noCache meta property", () => {
  let clock: FakeTimers.InstalledClock;
  let node1: Broker;

  beforeEach(() => {
    clock = FakeTimers.install();

    node1 = createNode({
      nodeId: "node1",
      logger: { enabled: false },
      cache: { enabled: true },
    });

    node1.createService({
      name: "testService",
      actions: {
        cachedAction: {
          cache: { keys: ["id"] },
          handler(context) {
            this.counter = this.counter + 1;
            return { id: (context.data as { id: number }).id, count: this.counter };
          },
        },
      },
      created() {
        this.counter = 0;
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
    clock.uninstall();
  });

  it("should bypass cache when $noCache meta is set to true", async () => {
    await node1.waitForServices(["testService"]);

    // First call - should cache the result
    const result1 = await node1.call("testService.cachedAction", { id: 1 });
    assert.deepStrictEqual(result1, { id: 1, count: 1 });

    // Second call with $noCache - should bypass cache
    const result2 = await node1.call(
      "testService.cachedAction",
      { id: 1 },
      { meta: { $noCache: true } },
    );
    assert.deepStrictEqual(result2, { id: 1, count: 2 });

    // Third call without $noCache - should still get cached result from first call
    const result3 = await node1.call("testService.cachedAction", { id: 1 });
    assert.deepStrictEqual(result3, { id: 1, count: 1 });
  });
});

describe("Cache condition function", () => {
  let node1: Broker;

  beforeEach(() => {
    node1 = createNode({
      nodeId: "node1",
      logger: { enabled: false },
      cache: { enabled: true },
    });

    node1.createService({
      name: "testService",
      actions: {
        conditionalCache: {
          cache: {
            keys: ["id"],
            condition(context: Context) {
              // Only cache if id is even
              const data = context.data as { id: number };
              return data.id % 2 === 0;
            },
          },
          handler(context) {
            this.counter = this.counter + 1;
            return { id: (context.data as { id: number }).id, count: this.counter };
          },
        },
      },
      created() {
        this.counter = 0;
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
  });

  it("should cache when condition returns true", async () => {
    await node1.waitForServices(["testService"]);

    // Even id - should cache
    const result1 = await node1.call("testService.conditionalCache", { id: 2 });
    assert.deepStrictEqual(result1, { id: 2, count: 1 });

    const result2 = await node1.call("testService.conditionalCache", { id: 2 });
    assert.deepStrictEqual(result2, { id: 2, count: 1 }); // Same count = cached
  });

  it("should not cache when condition returns false", async () => {
    await node1.waitForServices(["testService"]);

    // Odd id - should not cache
    const result1 = await node1.call("testService.conditionalCache", { id: 1 });
    assert.deepStrictEqual(result1, { id: 1, count: 1 });

    const result2 = await node1.call("testService.conditionalCache", { id: 1 });
    assert.deepStrictEqual(result2, { id: 1, count: 2 }); // Different count = not cached
  });
});

describe("Cache custom TTL", () => {
  let clock: FakeTimers.InstalledClock;
  let node1: Broker;

  beforeEach(() => {
    clock = FakeTimers.install();

    node1 = createNode({
      nodeId: "node1",
      logger: { enabled: false },
      cache: {
        enabled: true,
        ttl: 10000, // Global TTL: 10 seconds
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        shortTtl: {
          cache: {
            keys: ["id"],
            ttl: 1000, // Custom TTL: 1 second
          },
          handler(context) {
            this.counter = this.counter + 1;
            return { id: (context.data as { id: number }).id, count: this.counter };
          },
        },
        defaultTtl: {
          cache: {
            keys: ["id"],
            // Uses global TTL
          },
          handler(context) {
            this.counter = this.counter + 1;
            return { id: (context.data as { id: number }).id, count: this.counter };
          },
        },
      },
      created() {
        this.counter = 0;
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
    clock.uninstall();
  });

  it("should respect action-level TTL over global TTL", async () => {
    await node1.waitForServices(["testService"]);

    // Cache with short TTL
    const result1 = await node1.call("testService.shortTtl", { id: 1 });
    assert.deepStrictEqual(result1, { id: 1, count: 1 });

    // Still cached within TTL
    clock.tick(500);
    const result2 = await node1.call("testService.shortTtl", { id: 1 });
    assert.deepStrictEqual(result2, { id: 1, count: 1 });

    // Expired after TTL
    clock.tick(600);
    const result3 = await node1.call("testService.shortTtl", { id: 1 });
    assert.deepStrictEqual(result3, { id: 1, count: 2 });
  });

  it("should use global TTL when action TTL not specified", async () => {
    await node1.waitForServices(["testService"]);

    const result1 = await node1.call("testService.defaultTtl", { id: 1 });
    assert.deepStrictEqual(result1, { id: 1, count: 1 });

    // Still cached after 1 second (global TTL is 10 seconds)
    clock.tick(1100);
    const result2 = await node1.call("testService.defaultTtl", { id: 1 });
    assert.deepStrictEqual(result2, { id: 1, count: 1 });

    // Expired after 10 seconds
    clock.tick(9000);
    const result3 = await node1.call("testService.defaultTtl", { id: 1 });
    assert.deepStrictEqual(result3, { id: 1, count: 2 });
  });
});

describe("Cache key generation", () => {
  let node1: Broker;

  beforeEach(() => {
    node1 = createNode({
      nodeId: "node1",
      logger: { enabled: false },
      cache: { enabled: true },
    });

    node1.createService({
      name: "testService",
      actions: {
        singleKey: {
          cache: { keys: ["id"] },
          handler(_context) {
            this.counter = this.counter + 1;
            return { count: this.counter };
          },
        },
        multipleKeys: {
          cache: { keys: ["userId", "postId"] },
          handler(_context) {
            this.counter = this.counter + 1;
            return { count: this.counter };
          },
        },
        stringKeys: {
          cache: "userId postId",
          handler(_context) {
            this.counter = this.counter + 1;
            return { count: this.counter };
          },
        },
        allParamsCache: {
          cache: true,
          handler(_context) {
            this.counter = this.counter + 1;
            return { count: this.counter };
          },
        },
      },
      created() {
        this.counter = 0;
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
  });

  it("should cache with single key", async () => {
    await node1.waitForServices(["testService"]);

    await node1.call("testService.singleKey", { id: 1, extra: "a" });
    const result = await node1.call("testService.singleKey", { id: 1, extra: "b" });
    assert.deepStrictEqual(result, { count: 1 }); // Same cache key (id=1)

    const result2 = await node1.call("testService.singleKey", { id: 2, extra: "a" });
    assert.deepStrictEqual(result2, { count: 2 }); // Different cache key (id=2)
  });

  it("should cache with multiple keys", async () => {
    await node1.waitForServices(["testService"]);

    await node1.call("testService.multipleKeys", { userId: 1, postId: 100 });
    const result = await node1.call("testService.multipleKeys", { userId: 1, postId: 100 });
    assert.deepStrictEqual(result, { count: 1 });

    const result2 = await node1.call("testService.multipleKeys", { userId: 1, postId: 200 });
    assert.deepStrictEqual(result2, { count: 2 }); // Different postId

    const result3 = await node1.call("testService.multipleKeys", { userId: 2, postId: 100 });
    assert.deepStrictEqual(result3, { count: 3 }); // Different userId
  });

  it("should support string key notation", async () => {
    await node1.waitForServices(["testService"]);

    await node1.call("testService.stringKeys", { userId: 1, postId: 100 });
    const result = await node1.call("testService.stringKeys", { userId: 1, postId: 100 });
    assert.deepStrictEqual(result, { count: 1 });
  });

  it("should cache all params when cache is true", async () => {
    await node1.waitForServices(["testService"]);

    await node1.call("testService.allParamsCache", { a: 1, b: 2 });
    const result = await node1.call("testService.allParamsCache", { a: 1, b: 2 });
    assert.deepStrictEqual(result, { count: 1 });

    const result2 = await node1.call("testService.allParamsCache", { a: 1, b: 3 });
    assert.deepStrictEqual(result2, { count: 2 }); // Different params
  });
});

describe("Cache with lock - concurrent requests", () => {
  let node1: Broker;

  beforeEach(() => {
    node1 = createNode({
      nodeId: "node1",
      logger: { enabled: false },
      cache: {
        enabled: true,
        lock: { enabled: true },
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        slowAction: {
          cache: { keys: ["id"] },
          async handler(context) {
            this.counter = this.counter + 1;
            const currentCount = this.counter;
            // Simulate slow operation
            await new Promise((resolve) => setTimeout(resolve, 50));
            return { id: (context.data as { id: number }).id, count: currentCount };
          },
        },
      },
      created() {
        this.counter = 0;
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
  });

  it("should prevent duplicate execution with concurrent requests", async () => {
    await node1.waitForServices(["testService"]);

    // Launch 5 concurrent requests with the same key
    const results = await Promise.all([
      node1.call("testService.slowAction", { id: 1 }),
      node1.call("testService.slowAction", { id: 1 }),
      node1.call("testService.slowAction", { id: 1 }),
      node1.call("testService.slowAction", { id: 1 }),
      node1.call("testService.slowAction", { id: 1 }),
    ]);

    // All results should be the same (from the first execution)
    const counts = results.map((r) => (r as { count: number }).count);
    assert.ok(
      counts.every((c) => c === 1),
      `Expected all counts to be 1, got: ${counts.join(", ")}`,
    );
  });

  it("should handle concurrent requests with different keys", async () => {
    await node1.waitForServices(["testService"]);

    // Launch concurrent requests with different keys
    const results = await Promise.all([
      node1.call("testService.slowAction", { id: 1 }),
      node1.call("testService.slowAction", { id: 2 }),
      node1.call("testService.slowAction", { id: 3 }),
    ]);

    // Each should have been executed separately
    const counts = results.map((r) => (r as { count: number }).count);
    assert.deepStrictEqual(counts.sort(), [1, 2, 3]);
  });
});

describe("Cache isCachedResult flag", () => {
  let node1: Broker;

  beforeEach(() => {
    node1 = createNode({
      nodeId: "node1",
      logger: { enabled: false },
      cache: { enabled: true },
    });

    node1.createService({
      name: "testService",
      actions: {
        cachedAction: {
          cache: { keys: ["id"] },
          handler(context) {
            return { id: (context.data as { id: number }).id };
          },
        },
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
  });

  it("should set isCachedResult correctly on context", async () => {
    await node1.waitForServices(["testService"]);

    // First call - not cached
    const promise1 = node1.call("testService.cachedAction", { id: 1 });
    await promise1;
    assert.strictEqual(
      (promise1 as { context?: { isCachedResult?: boolean } }).context?.isCachedResult,
      false,
    );

    // Second call - cached
    const promise2 = node1.call("testService.cachedAction", { id: 1 });
    await promise2;
    assert.strictEqual(
      (promise2 as { context?: { isCachedResult?: boolean } }).context?.isCachedResult,
      true,
    );
  });
});
