const lockStore = require('../lib/index');

describe('In-Memory lock-store', () => {
  jest.useFakeTimers();

  let store;
  let eventStack = [];
  beforeEach(async () => {
    store = await lockStore.createLockStore();
    await store.connect();

    store.eventBus.on('lock-created', ({ key, metadata }) => {
      const meta = JSON.stringify(metadata);
      eventStack.push(`lock-created-${key}-${meta}`);
    });

    store.eventBus.on('lock-released', ({ key, metadata }) => {
      const meta = JSON.stringify(metadata);
      eventStack.push(`lock-released-${key}-${meta}`);
    });

    store.eventBus.on('lock-renewed', ({ key, metadata }) => {
      const meta = JSON.stringify(metadata);
      eventStack.push(`lock-renewed-${key}-${meta}`);
    });
  });

  afterEach(async () => {
    await store.flush();
    await store.disconnect();
    eventStack = [];
  });

  it('should lock', async () => {
    await store.acquire('test', Date.now() + 10000, { userId: '1234' });
    const isLocked = await store.isLocked('test');
    expect(isLocked).toBe(true);
    await store.release('test');
    const isLocked2 = await store.isLocked('test');
    expect(isLocked2).toBe(false);
    expect(eventStack).toEqual([
      'lock-created-test-{"userId":"1234"}',
      'lock-released-test-{"userId":"1234"}'
    ]);
  });

  it('should release lock', async () => {
    await store.acquire('test', Date.now() + 1000, { userId: '1234' });
    await store.release('test');
    const isLocked = await store.isLocked('test');
    expect(isLocked).toBe(false);
    expect(eventStack).toEqual([
      'lock-created-test-{"userId":"1234"}',
      'lock-released-test-{"userId":"1234"}'
    ]);
  });

  it('should release lock after time expired', async () => {
    await store.acquire('test', Date.now() + 2000);
    jest.advanceTimersByTime(1000);
    const isLocked1 = await store.isLocked('test');
    expect(isLocked1).toBe(true);
    jest.advanceTimersByTime(3000);
    const isLocked2 = await store.isLocked('test');
    expect(isLocked2).toBe(false);
    expect(eventStack).toEqual([
      'lock-created-test-{}',
      'lock-released-test-{}'
    ]);
  });
});
