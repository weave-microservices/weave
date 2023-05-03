const { createInMemoryLockStore } = require('./in-memory');

const createLockStore = (type, options = {}) => {
  switch (type) {
  case 'InMemory': {
    return createInMemoryLockStore(options);
  }
  default: {
    throw new Error('Database type invalid.');
  }
  }
};

module.exports = { createLockStore };
