const { createInMemoryStore } = require('./inMemory')

const createLockStore = (type, options = {}) => {
  switch (type) {
  case 'InMemory': {
    return createInMemoryStore(options)
  }
  default: {
    throw new Error('Database type invalid.')
  }
  }
}

module.exports = { createLockStore }
