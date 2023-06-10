const { createLockStore } = require('./createLockStore');
const { createInMemoryLockStoreAdapter } = require('./in-memory-adapter');

module.exports = { createLockStore, createInMemoryLockStoreAdapter };
