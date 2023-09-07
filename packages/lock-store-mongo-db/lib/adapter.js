const { MongoClient } = require('mongodb');

const createMongoDbLockStoreAdapter = async (userOptions = {}) => {
  const options = {
    url: 'mongodb://localhost:27017/lock_store',
    collectionName: 'lock_store',
    ...userOptions
  };

  let eventBus;
  /** @type {MongoClient} */
  let client;

  /** @type {Collection} */
  let collection;

  /**
   * Setup Database
   * @param {MongoClient} client Mongo client ref
   * @returns {Promise<void>} Promise
   */
  async function setupDatabase (client) {
    const db = await client.db();
    const collectionsRaw = await db.listCollections();
    const collections = await collectionsRaw.toArray();
    const collectionNames = collections.map((collection) => collection.name);
    if (!collectionNames.includes(options.collectionName)) {
      await client.db().createCollection(options.collectionName);
    }
  }

  async function connect (lockStoreEventBus) {
    try {
      eventBus = lockStoreEventBus;

      client = new MongoClient(options.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      await client.connect();
      await setupDatabase(client);
      const db = client.db();
      collection = db.collection(options.collectionName);
    } catch (error) {
      console.log('error, try to reconnect');
      throw error;
      // await connect();
    }
  }

  async function disconnect () {
    try {
      await client.close();
    } catch (error) {
      console.log('error while disconnect');
    }
  }

  const removeExpiredLocks = async () => {
    const removableLocks = await collection.find({
      expiresAt: {
        $lt: Date.now()
      }
    }).toArray();

    await Promise.all(removableLocks.map(async (lock) => {
      await collection.deleteOne({ _id: lock._id });
      eventBus.emit('lock-released', {
        key: lock.key,
        expiresAt: lock.expiresAt,
        metadata: lock.metadata
      });
    }));
  };

  const lock = async (key, expiresAt = Number.MAX_SAFE_INTEGER, metadata) => {
    const isLocked = await collection.findOne({ key });

    if (isLocked) {
      throw new Error('Failed to acquire lock.');
    }

    const lock = { key, expiresAt };
    await collection.insertOne(lock);
    eventBus.emit('lock-created', {
      key: lock.key,
      expiresAt: lock.expiresAt,
      metadata: lock.metadata
    });
  };

  const getLock = async (hash) => {
    return await collection.findOne({ key: hash });
  };

  const isLocked = async (hash) => {
    const isLocked = await collection.find({ key: hash }).toArray();
    return isLocked.length > 0;
  };

  const release = async (key) => {
    const locks = await collection.find({ key }).toArray();
    await Promise.all(locks.map(async (lock) => {
      await collection.deleteOne({ _id: lock._id });
      eventBus.emit('lock-released', {
        key: lock.key,
        expiresAt: lock.expiresAt,
        metadata: lock.metadata
      });
    }));
  };

  /**
   * Renew the value lock
   * @param {string} key Hash
   * @param {number} expiresAt Expiring timestamp
   * @returns {Promise<void>} Result
   */
  const renew = async (key, expiresAt) => {
    const locks = await collection.find({ key }).toArray();
    await Promise.all(locks.map(async (lock) => {
      await collection.updateOne({ _id: lock._id }, { $set: { expiresAt }});
      eventBus.emit('lock-renewed', {
        key: lock.key,
        expiresAt: lock.expiresAt,
        metadata: lock.metadata
      });
    }));
  };

  const flush = async () => {
    const locks = await collection.find({}).toArray();
    await Promise.all(locks.map(async (lock) => {
      await collection.deleteOne({ _id: lock._id });
      eventBus.emit('lock-released', {
        key: lock.key,
        expiresAt: lock.expiresAt,
        metadata: lock.metadata
      });
    }));
  };

  return { connect, disconnect, removeExpiredLocks, lock, getLock, isLocked, renew, release, flush };
};

module.exports = { createMongoDbLockStoreAdapter };
