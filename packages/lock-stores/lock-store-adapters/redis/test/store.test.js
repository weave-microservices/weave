const lockStore = require('@weave-js/lock-store');
const { createMongoDbLockStore } = require('../lib/index');

jest.setTimeout(30000);

describe('lock-store', () => {
  jest.useFakeTimers();

  let store;
  beforeAll(async () => {
    store = await lockStore.createLockStore({
      adapter: await createMongoDbLockStore({ url: `${process.env.MONGO_URL}${globalThis.__MONGO_DB_NAME__}` })
    });
  });

  afterAll(async () => {
  });

  it('should lock', async () => {
    await store.connect();

    await store.acquire('test', Date.now() + 1000);
    const isLocked = await store.isLocked('test');
    expect(isLocked).toBe(true);
    await store.disconnect();
  });

  // it('should release lock', async () => {
  //   const store = await lockStore.createLockStore();
  //   await store.acquire('test', Date.now() + 1000);
  //   await store.release('test');
  //   const isLocked = await store.isLocked('test');
  //   expect(isLocked).toBe(false);
  // });

  // it('should release lock after time expired', async () => {
  //   const store = await lockStore.createLockStore();
  //   await store.acquire('test', Date.now() + 2000);
  //   jest.advanceTimersByTime(1000);
  //   const isLocked1 = await store.isLocked('test');
  //   expect(isLocked1).toBe(true);
  //   jest.advanceTimersByTime(3000);
  //   const isLocked2 = await store.isLocked('test');
  //   expect(isLocked2).toBe(false);
  // });
});
