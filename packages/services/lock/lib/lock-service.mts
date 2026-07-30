/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2023 Fachwerk
 */

import {
  createLockStore,
  createInMemoryLockStoreAdapter,
  type Lock,
  type LockMetadata,
  type LockStore,
  type LockStoreAdapter,
} from "@weave-js/lock-store";
import type { Context, Service, ServiceSchema } from "@weave-js/core/types/index.js";
import { getHash } from "../utils/getHash.mts";

export interface LockServiceOptions {
  /** Name of the service - defaults to `$lock`. */
  name?: string;
  /** Store adapter - defaults to the in-memory adapter. */
  adapter?: LockStoreAdapter | Promise<LockStoreAdapter>;
}

/** The lock service instance - carries the store it works on. */
interface LockService extends Service {
  store: LockStore;
}

/**
 * The service instance carries the lock store, which the generic service type of
 * the core does not know about. This keeps the cast in one place.
 */
const asLockService = (service: Service): LockService => service as LockService;

export interface AcquireLockParams {
  key: string;
  expiresAt?: number;
  metadata?: LockMetadata;
}

export interface LockKeyParams {
  key: string;
}

export interface RenewLockParams {
  key: string;
  expiresAt: number;
}

export interface LockStoreEventParams extends Lock {
  event: string;
}

/** Events that are forwarded from the store event bus to the broker. */
const FORWARDED_EVENTS = ["lock-created", "lock-released", "lock-renewed"] as const;

const assertNotInThePast = (expiresAt: number): void => {
  if (expiresAt < Date.now()) {
    throw new Error("A lock must not expire in the past.");
  }
};

/**
 * Creates the distributed lock service.
 */
export const createLockService = (lockServiceOptions: LockServiceOptions = {}): ServiceSchema => {
  const name = lockServiceOptions.name ?? "$lock";

  const actions = {
    handleLockStoreEvent: {
      params: {
        event: "string",
        key: "string",
        expiresAt: "number",
        metadata: { type: "object", optional: true },
      },
      async handler(this: Service, context: Context) {
        // The params schema above validates the payload at runtime.
        const { event } = context.data as LockStoreEventParams;

        await context.emit(`${this.name}.${event}`, context.data);
      },
    },
    acquireLock: {
      params: {
        key: { type: "string" },
        expiresAt: { type: "number", optional: true, default: Number.MAX_SAFE_INTEGER },
        metadata: { type: "object", optional: true },
      },
      async handler(this: Service, context: Context) {
        const {
          key,
          expiresAt = Number.MAX_SAFE_INTEGER,
          metadata,
        } = context.data as AcquireLockParams;

        assertNotInThePast(expiresAt);

        await asLockService(this).store.acquire(getHash(key), expiresAt, metadata);

        return true;
      },
    },
    isLocked: {
      params: {
        key: { type: "string" },
      },
      handler(this: Service, context: Context) {
        const { key } = context.data as LockKeyParams;

        return asLockService(this).store.isLocked(getHash(key));
      },
    },
    renewLock: {
      params: {
        key: { type: "string" },
        expiresAt: { type: "number" },
      },
      handler(this: Service, context: Context) {
        const { key, expiresAt } = context.data as RenewLockParams;

        assertNotInThePast(expiresAt);

        return asLockService(this).store.renew(getHash(key), expiresAt);
      },
    },
    releaseLock: {
      params: {
        key: { type: "string" },
      },
      handler(this: Service, context: Context) {
        const { key } = context.data as LockKeyParams;

        return asLockService(this).store.release(getHash(key));
      },
    },
    flush: {
      handler(this: Service) {
        return asLockService(this).store.flush();
      },
    },
  };

  const service: ServiceSchema = {
    name,
    actions,
    async created(this: Service) {
      const adapter = await (lockServiceOptions.adapter ?? createInMemoryLockStoreAdapter());

      asLockService(this).store = await createLockStore({ adapter });
    },
    async started(this: Service) {
      const { store } = asLockService(this);

      await store.connect();

      FORWARDED_EVENTS.forEach((event) => {
        store.eventBus.on(event, (lock: Lock) => {
          this.actions.handleLockStoreEvent({ event, ...lock });
        });
      });
    },
    async stopped(this: Service) {
      await asLockService(this).store.disconnect();
    },
  };

  return service;
};

export default createLockService;
