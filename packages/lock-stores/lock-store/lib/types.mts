import type { EventEmitter } from "events";

/**
 * A lock as it is stored by an adapter.
 */
export interface Lock {
  key: string;
  expiresAt: number;
  metadata: LockMetadata;
}

export type LockMetadata = Record<string, unknown>;

/**
 * Events emitted on the event bus of a lock store.
 *
 * - `lock-created` - a lock was acquired
 * - `lock-released` - a lock was released or expired
 * - `lock-renewed` - the expiry of a lock was extended
 */
export type LockStoreEvent = "lock-created" | "lock-released" | "lock-renewed";

/**
 * Storage backend of a lock store.
 */
export interface LockStoreAdapter {
  connect(eventBus: EventEmitter): Promise<void>;
  disconnect(): Promise<void>;
  removeExpiredLocks(): Promise<void>;
  lock(key: string, expiresAt: number, metadata: LockMetadata): Promise<void>;
  isLocked(key: string): Promise<boolean>;
  renew(key: string, expiresAt: number): Promise<void>;
  release(key: string): Promise<void>;
  getLock(key: string): Promise<Lock | undefined>;
  flush(): Promise<void>;
}

export interface LockStoreOptions {
  adapter?: LockStoreAdapter;
}

/**
 * Lock store instance.
 */
export interface LockStore {
  eventBus: EventEmitter;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  acquire(key: string, expiresAt?: number, metadata?: LockMetadata): Promise<void>;
  isLocked(key: string): Promise<boolean>;
  renew(key: string, expiresAt: number): Promise<void>;
  release(key: string): Promise<void>;
  flush(): Promise<void>;
}
