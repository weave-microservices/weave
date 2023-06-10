const { createBroker } = require('@weave-js/core');
const { createLockService } = require('../lib/lock-service');
const fakeTimers = require('@sinonjs/fake-timers');
const { createMongoDbLockStoreAdapter } = require('../../../lock-stores/lock-store-adapters/mongo-db/lib');

describe('Test lock service', () => {
  let clock;
  beforeEach(() => {
    clock = fakeTimers.install();
  });
  afterEach(() => {
    clock.uninstall();
  });

  it('should lock and release a value.', async () => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    broker1.createService(createLockService());
    broker1.bus.on('$lock.*', (lock) => {
      console.log(lock.key);
    });

    await broker1.start();

    await broker1.call('$lock.acquireLock', { key: 'my-lock-key', metadata: { userId: 1 }});

    const isLocked = await broker1.call('$lock.isLocked', { key: 'my-lock-key' });
    expect(isLocked).toBe(true);
    await broker1.call('$lock.releaseLock', { key: 'my-lock-key' });
    const isStillLocked = await broker1.call('$lock.isLocked', { key: 'my-lock-key' });
    expect(isStillLocked).toBe(false);
  });

  it('should lock and remove expired values.', async () => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    broker1.createService(createLockService());

    await broker1.start();

    await broker1.call('$lock.acquireLock', { key: 'my-lock-key', expiresAt: Date.now() + 2000 });
    const isLocked = await broker1.call('$lock.isLocked', { key: 'my-lock-key' });
    expect(isLocked).toBe(true);
    clock.tick(5000);
    const isStillLocked = await broker1.call('$lock.isLocked', { key: 'my-lock-key' });
    expect(isStillLocked).toBe(false);
  });

  it('should lock and renew values.', async () => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    broker1.createService(createLockService());

    await broker1.start();

    await broker1.call('$lock.acquireLock', { key: 'my-lock-key', expiresAt: Date.now() + 2000 });
    const isLocked = await broker1.call('$lock.isLocked', { key: 'my-lock-key' });
    expect(isLocked).toBe(true);
    clock.tick(5000);
    const isStillLocked = await broker1.call('$lock.isLocked', { key: 'my-lock-key' });
    expect(isStillLocked).toBe(false);
  });

  it('should lock and renew values.', async () => {
    const broker1 = createBroker({
      nodeId: 'node1',
      logger: {
        enabled: false
      }
    });

    broker1.createService(createLockService());

    await broker1.start();

    await broker1.call('$lock.acquireLock', { key: 'my-lock-key', expiresAt: Date.now() + 2000 });
    const isLocked = await broker1.call('$lock.isLocked', { key: 'my-lock-key' });
    expect(isLocked).toBe(true);
    await broker1.call('$lock.renewLock', { key: 'my-lock-key', expiresAt: Date.now() + 4000 }); // 4000
    const isStillLocked = await broker1.call('$lock.isLocked', { key: 'my-lock-key' });
    expect(isStillLocked).toBe(true);
    clock.tick(3000);
  });
});
