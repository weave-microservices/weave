const lockStore = require('../lib/index');

describe('lock-store', () => {
  jest.useFakeTimers();

  it('should lock', async () => {
    const store = await lockStore.createLockStore();
    await store.acquire('test', Date.now() + 1000);
    const isLocked = await store.isLocked('test');
    expect(isLocked).toBe(true);
  });

  it('should release lock', async () => {
    const store = await lockStore.createLockStore();
    await store.acquire('test', Date.now() + 1000);
    await store.release('test');
    const isLocked = await store.isLocked('test');
    expect(isLocked).toBe(false);
  });

  it('should release lock after time expired', async () => {
    const store = await lockStore.createLockStore();
    await store.acquire('test', Date.now() + 2000);
    jest.advanceTimersByTime(1000);
    const isLocked1 = await store.isLocked('test');
    expect(isLocked1).toBe(true);
    jest.advanceTimersByTime(3000);
    const isLocked2 = await store.isLocked('test');
    expect(isLocked2).toBe(false);
  });
});
