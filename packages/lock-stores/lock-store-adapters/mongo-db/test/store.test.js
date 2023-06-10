const lockStore = require('@weave-js/lock-store');
const { createMongoDbLockStoreAdapter } = require('../lib/index');

jest.setTimeout(30000);

describe('lock-store', () => {
  jest.useFakeTimers({
    doNotFake: [
      'setImmediate',
      'nextTick'
    ]
  });

  let store;
  let eventStack = [];
  beforeEach(async () => {
    store = await lockStore.createLockStore({
      adapter: await createMongoDbLockStoreAdapter({ url: 'mongodb://localhost:27017/lock_store' })
    });

    store.eventBus.on('lock-created', ({ key }) => {
      eventStack.push(`lock-created-${key}`);
    });

    store.eventBus.on('lock-released', ({ key }) => {
      eventStack.push(`lock-released-${key}`);
    });

    store.eventBus.on('lock-renewed', ({ key }) => {
      eventStack.push(`lock-renewed-${key}`);
    });

    await store.connect();
  });

  afterEach(async () => {
    await store.flush();
    await store.disconnect();
    eventStack = [];
  });

  it('should lock and release', async () => {
    await store.acquire('test');
    const isLocked = await store.isLocked('test');
    expect(isLocked).toBe(true);
    await store.release('test');
    const isLocked2 = await store.isLocked('test');
    expect(isLocked2).toBe(false);
    expect(eventStack).toEqual([
      'lock-created-test',
      'lock-released-test'
    ]);
  });

  it('should lock and release after expiration time', async () => {
    await store.acquire('test', Date.now() + 1000);
    const isLockedBeforeExpiration = await store.isLocked('test');
    expect(isLockedBeforeExpiration).toBe(true);
    jest.advanceTimersByTime(2000);
    const isLocked = await store.isLocked('test');
    expect(isLocked).toBe(false);
    expect(eventStack).toEqual([
      'lock-created-test',
      'lock-released-test'
    ]);
  });

  it('should lock and renew the expiration time', async () => {
    await store.acquire('test', Date.now() + 1000);
    const isLockedBeforeExpiration = await store.isLocked('test');
    expect(isLockedBeforeExpiration).toBe(true);
    jest.advanceTimersByTime(500);
    const isLocked = await store.isLocked('test');
    expect(isLocked).toBe(true);
    await store.renew('test', Date.now() + 500);
    jest.advanceTimersByTime(600);
    const isLocked2 = await store.isLocked('test');
    expect(isLocked2).toBe(false);
    expect(eventStack).toEqual([
      'lock-created-test',
      'lock-renewed-test',
      'lock-released-test'
    ]);
  });
});
