/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

/**
 * Built-in cache adapter implementations
 *
 * Provides various caching backends:
 * - Base: Abstract base cache implementation
 * - InMemory: High-performance in-memory cache with LRU eviction
 *
 * Additional adapters available as separate packages:
 * - Redis: Distributed Redis cache
 * - Memcached: Memcached integration
 * - File: File-based persistent cache
 *
 * @namespace CacheAdapters
 */
export { createCacheBase } from './base.mts';
export { createInMemoryCache } from './inMemory.mts';
export { createInMemoryLruCache } from './inMemoryLru.mts';
