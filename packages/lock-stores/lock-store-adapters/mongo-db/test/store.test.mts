import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createLockStore, type LockStore, type LockStoreAdapter } from "@weave-js/lock-store";
import { installMongoMock, type MongoMock } from "./mongodb-mock.mts";

// The module mock has to be registered before the adapter is imported.
const mongo = installMongoMock();
let mongoMock: MongoMock;

const { createMongoDbLockStoreAdapter } = await import("../lib/index.mts");

describe("MongoDB lock-store adapter", () => {
  let adapter: LockStoreAdapter;
  let store: LockStore;
  let eventStack: string[];

  beforeEach(async () => {
    mongoMock = mongo.reset();
    eventStack = [];

    adapter = await createMongoDbLockStoreAdapter();
    store = await createLockStore({ adapter });

    for (const event of ["lock-created", "lock-released", "lock-renewed"]) {
      store.eventBus.on(event, ({ key }: { key: string }) => eventStack.push(`${event}-${key}`));
    }

    await store.connect();
  });

  afterEach(async () => {
    await store.disconnect();
  });

  describe("connect", () => {
    it("should connect with the default options", () => {
      assert.equal(mongoMock.url, "mongodb://localhost:27017/lock_store");
      assert.equal(mongoMock.connectCalls, 1);
      assert.equal(mongoMock.collectionName, "lock_store");
    });

    it("should create the collection if it does not exist", () => {
      assert.deepEqual(mongoMock.createdCollections, ["lock_store"]);
    });

    it("should not create the collection if it already exists", async () => {
      mongoMock = mongo.reset();
      mongoMock.existingCollections.push("lock_store");

      const existingAdapter = await createMongoDbLockStoreAdapter();
      const existingStore = await createLockStore({ adapter: existingAdapter });

      await existingStore.connect();

      assert.deepEqual(mongoMock.createdCollections, []);

      await existingStore.disconnect();
    });

    it("should honour custom options", async () => {
      mongoMock = mongo.reset();

      const customAdapter = await createMongoDbLockStoreAdapter({
        url: "mongodb://mongo.local:27017/custom",
        collectionName: "custom_locks",
      });
      const customStore = await createLockStore({ adapter: customAdapter });

      await customStore.connect();

      assert.equal(mongoMock.url, "mongodb://mongo.local:27017/custom");
      assert.equal(mongoMock.collectionName, "custom_locks");
      assert.deepEqual(mongoMock.createdCollections, ["custom_locks"]);

      await customStore.disconnect();
    });

    it("should close the client on disconnect", async () => {
      await store.disconnect();

      assert.equal(mongoMock.closeCalls, 1);

      // the afterEach hook disconnects again - that must stay harmless
      assert.equal(mongoMock.closeCalls, 1);
    });

    it("should fail if the adapter is used before it is connected", async () => {
      const unconnected = await createMongoDbLockStoreAdapter();

      await assert.rejects(() => unconnected.isLocked("test"), /not connected/);
    });
  });

  describe("locking", () => {
    it("should acquire and release a lock", async () => {
      await store.acquire("test", Date.now() + 10000, { userId: "1234" });

      assert.equal(await store.isLocked("test"), true);

      await store.release("test");

      assert.equal(await store.isLocked("test"), false);
      assert.deepEqual(eventStack, ["lock-created-test", "lock-released-test"]);
    });

    it("should store the metadata of a lock", async () => {
      await store.acquire("test", Date.now() + 10000, { userId: "1234" });

      assert.deepEqual(await adapter.getLock("test"), {
        key: "test",
        expiresAt: mongoMock.documents[0].expiresAt,
        metadata: { userId: "1234" },
      });
    });

    it("should emit the metadata of a lock", async () => {
      const metadata: unknown[] = [];

      store.eventBus.on("lock-created", (lock: { metadata: unknown }) =>
        metadata.push(lock.metadata),
      );

      await store.acquire("test", Date.now() + 10000, { userId: "1234" });

      assert.deepEqual(metadata, [{ userId: "1234" }]);
    });

    it("should not acquire a lock that is already held", async () => {
      await store.acquire("test", Date.now() + 10000);

      await assert.rejects(
        () => store.acquire("test", Date.now() + 10000),
        /Failed to acquire lock/,
      );
    });

    it("should reject a second lock on the same key on the adapter", async () => {
      await adapter.lock("test", Date.now() + 10000, {});

      await assert.rejects(
        () => adapter.lock("test", Date.now() + 10000, {}),
        /Failed to acquire lock/,
      );
    });

    it("should report an unknown key as not locked", async () => {
      assert.equal(await store.isLocked("unknown"), false);
    });

    it("should not report an expired lock as locked", async () => {
      await adapter.lock("test", Date.now() - 1000, {});

      assert.equal(await adapter.isLocked("test"), false);
    });

    it("should ignore the release of an unknown lock", async () => {
      await store.release("unknown");

      assert.deepEqual(eventStack, []);
    });

    it("should use the maximum expiry if none is given", async () => {
      await adapter.lock("test", undefined as unknown as number, {});

      assert.equal(mongoMock.documents[0].expiresAt, Number.MAX_SAFE_INTEGER);
    });
  });

  describe("expiry", () => {
    it("should remove expired locks and emit an event for each", async () => {
      await adapter.lock("expired", Date.now() - 1000, {});
      await adapter.lock("valid", Date.now() + 10000, {});

      await adapter.removeExpiredLocks();

      assert.deepEqual(
        mongoMock.documents.map((document) => document.key),
        ["valid"],
      );
      assert.deepEqual(eventStack, [
        "lock-created-expired",
        "lock-created-valid",
        "lock-released-expired",
      ]);
    });

    it("should drop expired locks when the store checks them", async () => {
      await adapter.lock("test", Date.now() - 1000, {});

      assert.equal(await store.isLocked("test"), false);
      assert.deepEqual(mongoMock.documents, []);
    });
  });

  describe("renew", () => {
    it("should renew a lock and emit the new expiry", async () => {
      const renewals: number[] = [];

      store.eventBus.on("lock-renewed", (lock: { expiresAt: number }) =>
        renewals.push(lock.expiresAt),
      );

      await store.acquire("test", Date.now() + 1000);

      const expiresAt = Date.now() + 60000;
      await store.renew("test", expiresAt);

      assert.equal(mongoMock.documents[0].expiresAt, expiresAt);
      assert.deepEqual(renewals, [expiresAt]);
    });

    it("should not renew an unknown lock", async () => {
      await assert.rejects(() => store.renew("unknown", Date.now() + 1000), /Failed to renew lock/);
    });

    it("should not renew an unknown lock directly on the adapter", async () => {
      await assert.rejects(
        () => adapter.renew("unknown", Date.now() + 1000),
        /Failed to renew lock/,
      );
    });
  });

  describe("flush", () => {
    it("should remove all locks and emit an event for each", async () => {
      await store.acquire("first", Date.now() + 10000);
      await store.acquire("second", Date.now() + 10000);

      await store.flush();

      assert.deepEqual(mongoMock.documents, []);
      assert.deepEqual(eventStack, [
        "lock-created-first",
        "lock-created-second",
        "lock-released-first",
        "lock-released-second",
      ]);
    });
  });
});
