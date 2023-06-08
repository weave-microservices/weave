const { MongoClient, Collection } = require('mongodb');

const createMongoDbLockStore = async (userOptions = {}) => {
  const options = {
    url: 'mongodb://localhost:27017/lock_store',
    collectionName: 'lock_store',
    ...userOptions
  };

  let isConnected = false;
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

  async function connect () {
    try {
      client = await MongoClient.connect(options.url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });

      await client.connect();
      collection = client.db().collection(options.collectionName);

      await collection.insertMany([{ name: 'oedasd' }]);
      await setupDatabase(client);
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
    const res = await collection.find({
      // expiresAt: {
      //   $gt: Date.now()
      // }
    });
    console.log('deleted');
  };

  const acquire = async (hash, expiresAt = Number.MAX_SAFE_INTEGER) => {
    await removeExpiredLocks();
    const isLocked = await collection.findOne({ value: hash });

    // const isLocked = database.locks.some(lock => {
    //   lock.value === hash;
    // });

    if (isLocked) {
      throw new Error('Failed to acquire lock.');
    }

    const lock = { value: hash, expiresAt };
    await collection.insertOne(lock);
  };

  const isLocked = async (hash) => {
    const isLocked = await collection.find({ value: hash }).toArray();
    return !!isLocked;
  };

  const release = async (hash) => {
    await removeExpiredLocks();

    const index = database.locks.findIndex(lock => {
      return lock.value === hash;
    });

    // The lock is already released
    if (index === -1) {
      return;
    }

    database.locks.splice(index, 1);
  };

  /**
   * Renew the value lock
   * @param {string} hash Hash
   * @param {number} expiresAt Expiring timestamp
   * @returns {Promise<void>} Result
   */
  const renew = async (hash, expiresAt) => {
    await removeExpiredLocks();

    const existingLock = database.locks.find(lock => {
      return lock.value === hash;
    });

    // The lock is already released
    if (!existingLock) {
      throw new Error('Failed to renew lock.');
    }

    existingLock.expiresAt = expiresAt;
  };

  return { connect, disconnect, removeExpiredLocks, acquire, isLocked, renew, release };
};

module.exports = { createMongoDbLockStore };
