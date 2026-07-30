import type { EventEmitter } from "events";
import type { Lock, LockMetadata, LockStoreAdapter } from "./types.mts";

/**
 * Creates an in-memory lock store adapter.
 *
 * Locks are kept in the process memory only - use a persistent adapter if the
 * locks have to be shared between nodes.
 */
export const createInMemoryLockStoreAdapter = async (): Promise<LockStoreAdapter> => {
  const database: { locks: Lock[] } = {
    locks: [],
  };

  let eventBus: EventEmitter | undefined;

  const emit = (event: string, lock: Lock): void => {
    eventBus?.emit(event, {
      key: lock.key,
      expiresAt: lock.expiresAt,
      metadata: lock.metadata,
    });
  };

  const connect = async (lockStoreEventBus: EventEmitter): Promise<void> => {
    eventBus = lockStoreEventBus;
  };

  const disconnect = async (): Promise<void> => {
    eventBus = undefined;
  };

  const removeExpiredLocks = async (): Promise<void> => {
    const expired: Lock[] = [];

    database.locks = database.locks.filter((lock) => {
      if (lock.expiresAt >= Date.now()) {
        return true;
      }

      expired.push(lock);
      return false;
    });

    expired.forEach((lock) => emit("lock-released", lock));
  };

  const lock = async (key: string, expiresAt: number, metadata: LockMetadata): Promise<void> => {
    const newLock: Lock = { key, expiresAt, metadata };

    database.locks.push(newLock);
    emit("lock-created", newLock);
  };

  const getLock = async (key: string): Promise<Lock | undefined> => {
    return database.locks.find((lock) => lock.key === key);
  };

  const isLocked = async (key: string): Promise<boolean> => {
    return database.locks.some((lock) => lock.key === key && Date.now() <= lock.expiresAt);
  };

  const release = async (key: string): Promise<void> => {
    await removeExpiredLocks();

    const index = database.locks.findIndex((lock) => lock.key === key);

    // The lock is already released
    if (index === -1) {
      return;
    }

    const [existingLock] = database.locks.splice(index, 1);

    emit("lock-released", existingLock);
  };

  const renew = async (key: string, expiresAt: number): Promise<void> => {
    await removeExpiredLocks();

    const existingLock = database.locks.find((lock) => lock.key === key);

    // The lock is already released
    if (!existingLock) {
      throw new Error("Failed to renew lock.");
    }

    existingLock.expiresAt = expiresAt;
    emit("lock-renewed", existingLock);
  };

  const flush = async (): Promise<void> => {
    database.locks = [];
  };

  return {
    connect,
    disconnect,
    removeExpiredLocks,
    lock,
    isLocked,
    renew,
    release,
    getLock,
    flush,
  };
};
