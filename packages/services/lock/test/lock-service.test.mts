import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { createBroker } from "@weave-js/core";
import type { Context } from "@weave-js/core/types/index.js";
import { createInMemoryLockStoreAdapter } from "@weave-js/lock-store";
import { createLockService } from "../lib/lock-service.mts";
import { getHash } from "../utils/getHash.mts";

describe("Test lock service", () => {
  let broker: ReturnType<typeof createBroker>;
  let emittedEvents: Array<{ event: string; key: string }>;

  const startBroker = async (service = createLockService()) => {
    broker = createBroker({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    broker.createService(service);

    broker.createService({
      name: "eventListener",
      events: {
        "$lock.*"(context: Context) {
          emittedEvents.push({ event: context.eventName!, key: context.data.key });
        },
      },
    });

    await broker.start();

    return broker;
  };

  beforeEach(() => {
    emittedEvents = [];
    mock.timers.enable({ apis: ["Date"] });
  });

  afterEach(async () => {
    mock.timers.reset();
    await broker?.stop();
  });

  describe("acquireLock", () => {
    it("should lock and release a value", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "my-lock-key", metadata: { userId: 1 } });

      assert.equal(await broker.call("$lock.isLocked", { key: "my-lock-key" }), true);

      await broker.call("$lock.releaseLock", { key: "my-lock-key" });

      assert.equal(await broker.call("$lock.isLocked", { key: "my-lock-key" }), false);
    });

    it("should return true after acquiring a lock", async () => {
      await startBroker();

      const result = await broker.call("$lock.acquireLock", { key: "my-lock-key" });

      assert.equal(result, true);
    });

    it("should not lock a key twice", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "my-lock-key" });

      await assert.rejects(
        () => broker.call("$lock.acquireLock", { key: "my-lock-key" }),
        /Failed to acquire lock/,
      );
    });

    it("should reject an expiry in the past", async () => {
      await startBroker();

      await assert.rejects(
        () =>
          broker.call("$lock.acquireLock", { key: "my-lock-key", expiresAt: Date.now() - 1000 }),
        /A lock must not expire in the past/,
      );
    });

    it("should keep different keys apart", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "first" });

      assert.equal(await broker.call("$lock.isLocked", { key: "second" }), false);
    });

    it("should store the hash of a key instead of the key itself", async () => {
      const adapter = await createInMemoryLockStoreAdapter();

      await startBroker(createLockService({ adapter }));

      await broker.call("$lock.acquireLock", { key: "my-lock-key" });

      assert.equal(await adapter.isLocked(getHash("my-lock-key")), true);
      assert.equal(await adapter.isLocked("my-lock-key"), false);
    });
  });

  describe("expiry", () => {
    it("should release a lock once it expired", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "my-lock-key", expiresAt: Date.now() + 2000 });

      assert.equal(await broker.call("$lock.isLocked", { key: "my-lock-key" }), true);

      mock.timers.tick(5000);

      assert.equal(await broker.call("$lock.isLocked", { key: "my-lock-key" }), false);
    });

    it("should keep a lock without an expiry", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "my-lock-key" });

      mock.timers.tick(1000 * 60 * 60 * 24);

      assert.equal(await broker.call("$lock.isLocked", { key: "my-lock-key" }), true);
    });
  });

  describe("renewLock", () => {
    it("should renew a lock", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "my-lock-key", expiresAt: Date.now() + 2000 });
      await broker.call("$lock.renewLock", { key: "my-lock-key", expiresAt: Date.now() + 4000 });

      mock.timers.tick(3000);

      assert.equal(await broker.call("$lock.isLocked", { key: "my-lock-key" }), true);
    });

    it("should reject an expiry in the past", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "my-lock-key" });

      await assert.rejects(
        () => broker.call("$lock.renewLock", { key: "my-lock-key", expiresAt: Date.now() - 1000 }),
        /A lock must not expire in the past/,
      );
    });

    it("should not renew an unknown lock", async () => {
      await startBroker();

      await assert.rejects(
        () => broker.call("$lock.renewLock", { key: "unknown", expiresAt: Date.now() + 1000 }),
        /Failed to renew lock/,
      );
    });
  });

  describe("flush", () => {
    it("should release all locks", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "first" });
      await broker.call("$lock.acquireLock", { key: "second" });

      await broker.call("$lock.flush");

      assert.equal(await broker.call("$lock.isLocked", { key: "first" }), false);
      assert.equal(await broker.call("$lock.isLocked", { key: "second" }), false);
    });
  });

  describe("events", () => {
    it("should emit an event when a lock is created and released", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "my-lock-key" });
      await broker.call("$lock.releaseLock", { key: "my-lock-key" });

      assert.deepEqual(
        emittedEvents.map((entry) => entry.event),
        ["$lock.lock-created", "$lock.lock-released"],
      );
      assert.equal(emittedEvents[0].key, getHash("my-lock-key"));
    });

    it("should emit an event when a lock is renewed", async () => {
      await startBroker();

      await broker.call("$lock.acquireLock", { key: "my-lock-key", expiresAt: Date.now() + 2000 });
      await broker.call("$lock.renewLock", { key: "my-lock-key", expiresAt: Date.now() + 4000 });

      assert.deepEqual(
        emittedEvents.map((entry) => entry.event),
        ["$lock.lock-created", "$lock.lock-renewed"],
      );
    });
  });

  describe("options", () => {
    it("should use a custom service name", async () => {
      await startBroker(createLockService({ name: "my-lock-service" }));

      await broker.call("my-lock-service.acquireLock", { key: "my-lock-key" });

      assert.equal(await broker.call("my-lock-service.isLocked", { key: "my-lock-key" }), true);
    });

    it("should use a custom adapter instance", async () => {
      const adapter = await createInMemoryLockStoreAdapter();

      await startBroker(createLockService({ adapter }));

      await broker.call("$lock.acquireLock", { key: "my-lock-key" });

      assert.equal(await adapter.isLocked(getHash("my-lock-key")), true);
    });

    it("should accept an adapter promise", async () => {
      await startBroker(createLockService({ adapter: createInMemoryLockStoreAdapter() }));

      await broker.call("$lock.acquireLock", { key: "my-lock-key" });

      assert.equal(await broker.call("$lock.isLocked", { key: "my-lock-key" }), true);
    });
  });
});

describe("getHash", () => {
  it("should hash a value with sha256", () => {
    assert.match(getHash("my-lock-key"), /^[a-f0-9]{64}$/);
  });

  it("should be stable for the same value", () => {
    assert.equal(getHash("my-lock-key"), getHash("my-lock-key"));
  });

  it("should differ for different values", () => {
    assert.notEqual(getHash("first"), getHash("second"));
  });
});
