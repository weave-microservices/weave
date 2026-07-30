import { MongoClient, type Collection, type Document } from "mongodb";
import type { EventEmitter } from "events";
import type { Lock, LockMetadata, LockStoreAdapter } from "@weave-js/lock-store";

export interface MongoDbLockStoreAdapterOptions {
  /** Connection string of the MongoDB instance. */
  url?: string;
  /** Name of the collection the locks are stored in. */
  collectionName?: string;
}

/**
 * A lock document as it is stored in MongoDB.
 */
interface LockDocument extends Document {
  key: string;
  expiresAt: number;
  metadata: LockMetadata;
}

const defaultOptions: Required<MongoDbLockStoreAdapterOptions> = {
  url: "mongodb://localhost:27017/lock_store",
  collectionName: "lock_store",
};

const toLock = (document: LockDocument): Lock => ({
  key: document.key,
  expiresAt: document.expiresAt,
  metadata: document.metadata,
});

/**
 * Creates a MongoDB backed lock store adapter.
 */
export const createMongoDbLockStoreAdapter = async (
  userOptions: MongoDbLockStoreAdapterOptions = {},
): Promise<LockStoreAdapter> => {
  const options = { ...defaultOptions, ...userOptions };

  let eventBus: EventEmitter | undefined;
  let client: MongoClient | undefined;
  let collection: Collection<LockDocument> | undefined;

  const emit = (event: string, lock: Lock): void => {
    eventBus?.emit(event, lock);
  };

  /**
   * Returns the lock collection or fails if the adapter is not connected.
   */
  const getCollection = (): Collection<LockDocument> => {
    if (!collection) {
      throw new Error("Lock store adapter is not connected.");
    }

    return collection;
  };

  /**
   * Creates the lock collection if it does not exist yet.
   */
  const setupDatabase = async (mongoClient: MongoClient): Promise<void> => {
    const db = mongoClient.db();
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((entry) => entry.name);

    if (!collectionNames.includes(options.collectionName)) {
      await db.createCollection(options.collectionName);
    }
  };

  const connect = async (lockStoreEventBus: EventEmitter): Promise<void> => {
    eventBus = lockStoreEventBus;

    client = new MongoClient(options.url);

    await client.connect();
    await setupDatabase(client);

    collection = client.db().collection<LockDocument>(options.collectionName);
  };

  const disconnect = async (): Promise<void> => {
    const openClient = client;

    client = undefined;
    collection = undefined;
    eventBus = undefined;

    await openClient?.close();
  };

  /**
   * Removes all documents matching the filter and emits `lock-released` for each.
   */
  const removeLocks = async (filter: Document): Promise<void> => {
    const locks = await getCollection().find(filter).toArray();

    await Promise.all(
      locks.map(async (lock) => {
        await getCollection().deleteOne({ _id: lock._id });
        emit("lock-released", toLock(lock));
      }),
    );
  };

  const removeExpiredLocks = async (): Promise<void> => {
    await removeLocks({ expiresAt: { $lt: Date.now() } });
  };

  const lock = async (
    key: string,
    expiresAt: number = Number.MAX_SAFE_INTEGER,
    metadata: LockMetadata = {},
  ): Promise<void> => {
    const existingLock = await getCollection().findOne({ key });

    if (existingLock) {
      throw new Error("Failed to acquire lock.");
    }

    const newLock: LockDocument = { key, expiresAt, metadata };

    await getCollection().insertOne(newLock);
    emit("lock-created", toLock(newLock));
  };

  const getLock = async (key: string): Promise<Lock | undefined> => {
    const document = await getCollection().findOne({ key });

    return document ? toLock(document) : undefined;
  };

  const isLocked = async (key: string): Promise<boolean> => {
    const existingLock = await getCollection().findOne({
      key,
      expiresAt: { $gte: Date.now() },
    });

    return Boolean(existingLock);
  };

  const release = async (key: string): Promise<void> => {
    await removeLocks({ key });
  };

  const renew = async (key: string, expiresAt: number): Promise<void> => {
    const locks = await getCollection().find({ key }).toArray();

    if (!locks.length) {
      throw new Error("Failed to renew lock.");
    }

    await Promise.all(
      locks.map(async (lock) => {
        await getCollection().updateOne({ _id: lock._id }, { $set: { expiresAt } });
        emit("lock-renewed", { ...toLock(lock), expiresAt });
      }),
    );
  };

  const flush = async (): Promise<void> => {
    await removeLocks({});
  };

  return {
    connect,
    disconnect,
    removeExpiredLocks,
    lock,
    getLock,
    isLocked,
    renew,
    release,
    flush,
  };
};
