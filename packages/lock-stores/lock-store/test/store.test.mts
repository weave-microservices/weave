import { describe, it, beforeEach, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import { createInMemoryLockStoreAdapter, createLockStore, type LockStore } from "../lib/index.mts";

describe("In-Memory lock-store", () => {
  let store: LockStore;
  let eventStack: string[];

  beforeEach(async () => {
    mock.timers.enable({ apis: ["Date", "setTimeout"] });

    eventStack = [];
    store = await createLockStore();
    await store.connect();

    for (const event of ["lock-created", "lock-released", "lock-renewed"]) {
      store.eventBus.on(event, ({ key, metadata }: { key: string; metadata: unknown }) => {
        eventStack.push(`${event}-${key}-${JSON.stringify(metadata)}`);
      });
    }
  });

  afterEach(async () => {
    await store.flush();
    await store.disconnect();
    mock.timers.reset();
  });

  it("should lock", async () => {
    await store.acquire("test", Date.now() + 10000, { userId: "1234" });

    assert.equal(await store.isLocked("test"), true);

    await store.release("test");

    assert.equal(await store.isLocked("test"), false);
    assert.deepEqual(eventStack, [
      'lock-created-test-{"userId":"1234"}',
      'lock-released-test-{"userId":"1234"}',
    ]);
  });

  it("should release lock", async () => {
    await store.acquire("test", Date.now() + 1000, { userId: "1234" });
    await store.release("test");

    assert.equal(await store.isLocked("test"), false);
    assert.deepEqual(eventStack, [
      'lock-created-test-{"userId":"1234"}',
      'lock-released-test-{"userId":"1234"}',
    ]);
  });

  it("should release lock after time expired", async () => {
    await store.acquire("test", Date.now() + 2000);

    mock.timers.tick(1000);
    assert.equal(await store.isLocked("test"), true);

    mock.timers.tick(3000);
    assert.equal(await store.isLocked("test"), false);
    assert.deepEqual(eventStack, ["lock-created-test-{}", "lock-released-test-{}"]);
  });

  it("should lock forever if no expiry is given", async () => {
    await store.acquire("test");

    mock.timers.tick(Number.MAX_SAFE_INTEGER / 2);

    assert.equal(await store.isLocked("test"), true);
  });

  it("should not acquire a lock that is already held", async () => {
    await store.acquire("test", Date.now() + 10000);

    await assert.rejects(() => store.acquire("test", Date.now() + 10000), /Failed to acquire lock/);
  });

  it("should acquire a lock again once the previous one expired", async () => {
    await store.acquire("test", Date.now() + 1000, { first: true });

    mock.timers.tick(2000);

    await store.acquire("test", Date.now() + 1000, { second: true });

    assert.equal(await store.isLocked("test"), true);
    assert.deepEqual(eventStack, [
      "lock-created-test-{}".replace("{}", '{"first":true}'),
      "lock-released-test-{}".replace("{}", '{"first":true}'),
      "lock-created-test-{}".replace("{}", '{"second":true}'),
    ]);
  });

  it("should ignore the release of an unknown lock", async () => {
    await store.release("unknown");

    assert.deepEqual(eventStack, []);
  });

  it("should renew a lock", async () => {
    await store.acquire("test", Date.now() + 1000, { userId: "1234" });

    await store.renew("test", Date.now() + 5000);

    mock.timers.tick(2000);

    assert.equal(await store.isLocked("test"), true);
    assert.deepEqual(eventStack, [
      'lock-created-test-{"userId":"1234"}',
      'lock-renewed-test-{"userId":"1234"}',
    ]);
  });

  it("should not renew an unknown lock", async () => {
    await assert.rejects(() => store.renew("unknown", Date.now() + 1000), /Failed to renew lock/);
  });

  it("should not renew an expired lock", async () => {
    await store.acquire("test", Date.now() + 1000);

    mock.timers.tick(2000);

    await assert.rejects(() => store.renew("test", Date.now() + 5000), /Failed to renew lock/);
  });

  it("should flush all locks", async () => {
    await store.acquire("first", Date.now() + 10000);
    await store.acquire("second", Date.now() + 10000);

    await store.flush();

    assert.equal(await store.isLocked("first"), false);
    assert.equal(await store.isLocked("second"), false);
  });

  it("should use a custom adapter", async () => {
    const adapter = await createInMemoryLockStoreAdapter();
    const customStore = await createLockStore({ adapter });

    await customStore.connect();
    await customStore.acquire("test", Date.now() + 10000);

    assert.equal(await adapter.isLocked("test"), true);

    await customStore.disconnect();
  });
});

describe("In-Memory lock-store adapter", () => {
  it("should not emit events before it is connected", async () => {
    const adapter = await createInMemoryLockStoreAdapter();

    await adapter.lock("test", Date.now() + 10000, {});

    assert.equal(await adapter.isLocked("test"), true);
  });

  it("should not emit events after it is disconnected", async () => {
    const adapter = await createInMemoryLockStoreAdapter();
    const store = await createLockStore({ adapter });
    const events: string[] = [];

    store.eventBus.on("lock-created", () => events.push("lock-created"));

    await store.connect();
    await store.disconnect();
    await adapter.lock("test", Date.now() + 10000, {});

    assert.deepEqual(events, []);
  });

  it("should throw when renewing an unknown lock directly on the adapter", async () => {
    const adapter = await createInMemoryLockStoreAdapter();

    await assert.rejects(() => adapter.renew("unknown", Date.now() + 1000), /Failed to renew lock/);
  });

  it("should return a lock by key", async () => {
    const adapter = await createInMemoryLockStoreAdapter();
    const expiresAt = Date.now() + 10000;

    await adapter.lock("test", expiresAt, { userId: "1234" });

    assert.deepEqual(await adapter.getLock("test"), {
      key: "test",
      expiresAt,
      metadata: { userId: "1234" },
    });
    assert.equal(await adapter.getLock("unknown"), undefined);
  });
});
