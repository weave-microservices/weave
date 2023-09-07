const { createLock } = require('../../../lib/cache/lock');

describe('Test local cache lock', () => {
  it('should create with default options.', () => {
    const key = 'test';
    const lock = createLock();
    return lock.acquire(key).then(() => {
      expect(lock.isLocked(key)).toBeTruthy();
      return lock.release(key).then(() => {
        expect(lock.isLocked(key)).toBeFalsy();
      });
    });
  });
});
