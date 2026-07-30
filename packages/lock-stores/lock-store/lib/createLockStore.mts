import { EventEmitter } from "events";
import { createInMemoryLockStoreAdapter } from "./in-memory-adapter.mts";
import type { LockMetadata, LockStore, LockStoreOptions } from "./types.mts";

/**
 * Creates a lock store instance.
 * @param userOptions Options - defaults to the in-memory adapter
 */
export const createLockStore = async (userOptions: LockStoreOptions = {}): Promise<LockStore> => {
  const adapter = userOptions.adapter ?? (await createInMemoryLockStoreAdapter());

  const eventBus = new EventEmitter();

  const connect = async (): Promise<void> => {
    await adapter.connect(eventBus);
  };

  const disconnect = async (): Promise<void> => {
    await adapter.disconnect();
  };

  /**
   * Acquire a lock.
   * @param key Lock hash
   * @param expiresAt Expiring timestamp
   * @param metadata Metadata
   */
  const acquire = async (
    key: string,
    expiresAt: number = Number.MAX_SAFE_INTEGER,
    metadata: LockMetadata = {},
  ): Promise<void> => {
    await adapter.removeExpiredLocks();

    if (await adapter.isLocked(key)) {
      throw new Error("Failed to acquire lock.");
    }

    await adapter.lock(key, expiresAt, metadata);
  };

  const isLocked = async (key: string): Promise<boolean> => {
    await adapter.removeExpiredLocks();
    return adapter.isLocked(key);
  };

  const release = async (key: string): Promise<void> => {
    await adapter.removeExpiredLocks();
    await adapter.release(key);
  };

  const flush = async (): Promise<void> => {
    await adapter.flush();
  };

  /**
   * Renew the expiry of a lock.
   * @param key Lock hash
   * @param expiresAt Expiring timestamp
   */
  const renew = async (key: string, expiresAt: number): Promise<void> => {
    await adapter.removeExpiredLocks();

    const existingLock = await adapter.getLock(key);

    // The lock is already released
    if (!existingLock) {
      throw new Error("Failed to renew lock.");
    }

    await adapter.renew(key, expiresAt);
  };

  return { eventBus, connect, disconnect, acquire, isLocked, renew, release, flush };
};
