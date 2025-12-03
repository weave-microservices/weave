import FakeTimers from '@sinonjs/fake-timers';
import { createNode } from '../../helper/index.mts';
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';

describe('Cache system', () => {
  let clock;
  let node1;
  beforeEach(() => {
    clock = FakeTimers.install();

    node1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      cache: {
        enabled: true
      },
      metrics: {
        enabled: true
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        cachedAction: {
          cache: {
            keys: ['text']
          },
          handler (context) {
            this.counter = this.counter + 1;
            return context.data.text.split('').reverse().join('') + this.counter;
          }
        },
        notCachedAction: {
          handler (context) {
            this.counter = this.counter + 1;
            return context.data.text.split('').reverse().join('') + this.counter;
          }
        },
        cachedMultiParam: {
          params: {
            firstname: 'string',
            lastname: { type: 'string', optional: true }
          },
          cache: {
            keys: ['firstname', 'lastname']
          },
          handler (context) {
            this.counter = this.counter + 1;
            return `Hello ${context.data.firstname} ${context.data.lastname}! ${this.counter}`;
          }
        }
      },
      created () {
        this.counter = 0;
      }
    });

    node1.start();
  });
  afterEach(() => {
    node1.stop();
    clock.uninstall();
  });

  it('should return a cached result', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            // reverse text + internal counter number
            assert.strictEqual(result, 'resu olleh1');
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                assert.strictEqual(result, 'resu olleh1');
                node1.stop();
                done();
              });
          });
      });
  });

  it('should return a new result because the cached value is expired. (check in get function)', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            assert.strictEqual(result, 'resu olleh1');
            clock.tick(5000);
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                assert.strictEqual(result, 'resu olleh2');
                node1.stop();
                done();
              });
          });
      });
  });

  it('should return a new result because the cached value is expired. (check in expiration timer)', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            assert.strictEqual(result, 'resu olleh1');
            clock.tick(6000);
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                assert.strictEqual(result, 'resu olleh2');
                node1.stop();
                done();
              });
          });
      });
  });

  it('should work with uncached actions', async () => {
    await node1.waitForServices(['testService']);
    const promise = node1.call('testService.notCachedAction', { text: 'hello user' });
    const result = await promise;
    assert.strictEqual(result, 'resu olleh1');
    assert.strictEqual(promise.context.isCachedResult, false);
  });

  it('should work with multiple keys', async () => {
    await node1.waitForServices(['testService']);
    const promise = node1.call('testService.cachedMultiParam', { firstname: 'Donald', lastname: 'Duck' });
    const result = await promise;
    assert.strictEqual(result, 'Hello Donald Duck! 1');
    // cache is disabled, so "isCachedResult" is undefined.
    assert.ok(!(promise.context.isCachedResult));

    const promise2 = node1.call('testService.cachedMultiParam', { firstname: 'Donald', lastname: 'Duck' });
    const result2 = await promise;
    assert.strictEqual(result2, 'Hello Donald Duck! 1');

    // Result is cached, so "isCachedResult" is true.
    assert.ok(promise2.context.isCachedResult);

    // try to change the order
    const promise3 = node1.call('testService.cachedMultiParam', { lastname: 'Duck', firstname: 'Donald' });
    const result3 = await promise;
    assert.strictEqual(result3, 'Hello Donald Duck! 1');
    // Result is cached, so "isCachedResult" is true.
    assert.ok(promise3.context.isCachedResult);
  });

  it('should work with optional keys', async () => {
    await node1.waitForServices(['testService']);
    const promise = node1.call('testService.cachedMultiParam', { firstname: 'Donald' });
    const result = await promise;
    assert.strictEqual(result, 'Hello Donald undefined! 1');
    // cache is disabled, so "isCachedResult" is undefined.
    assert.ok(!(promise.context.isCachedResult));
  });
});

describe('Cache system with cache lock', () => {
  let clock;
  let node1;
  beforeEach(() => {
    clock = FakeTimers.install();

    node1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      cache: {
        enabled: true,
        lock: {
          enabled: true
        }
      },
      metrics: {
        enabled: true
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        cachedAction: {
          cache: {
            keys: ['text']
          },
          handler (context) {
            this.counter = this.counter + 1;
            return context.data.text.split('').reverse().join('') + this.counter;
          }
        }
      },
      created () {
        this.counter = 0;
      }
    });

    node1.start();
  });
  afterEach(() => {
    node1.stop();
    clock.uninstall();
  });

  it('should return a cached result', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            assert.strictEqual(result, 'resu olleh1');
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                assert.strictEqual(result, 'resu olleh1');
                node1.stop();
                done();
              });
          });
      });
  });

  it('should return a new result because the cached value is expired. (check in get function)', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            assert.strictEqual(result, 'resu olleh1');
            clock.tick(5000);
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                assert.strictEqual(result, 'resu olleh2');
                node1.stop();
                done();
              });
          });
      });
  });

  it('should return a new result because the cached value is expired. (check in expiration timer)', (done) => {
    node1.waitForServices(['testService'])
      .then(() => {
        node1.call('testService.cachedAction', { text: 'hello user' })
          .then(result => {
            assert.strictEqual(result, 'resu olleh1');
            clock.tick(6000);
            node1.call('testService.cachedAction', { text: 'hello user' })
              .then(result => {
                assert.strictEqual(result, 'resu olleh2');
                node1.stop();
                done();
              });
          });
      });
  });
});

describe('Cache system manual', () => {
  let clock;
  let node1;
  beforeEach(() => {
    clock = FakeTimers.install();

    node1 = createNode({
      nodeId: 'node1',
      logger: {
        enabled: false
      },
      cache: {
        enabled: true
      },
      metrics: {
        enabled: true
      }
    });

    node1.createService({
      name: 'testService',
      actions: {
        cachedAction: {
          cache: {
            keys: ['text']
          },
          handler (context) {
            this.counter = this.counter + 1;
            return context.data.text.split('').reverse().join('') + this.counter;
          }
        },
        notCachedAction: {
          handler (context) {
            this.counter = this.counter + 1;
            return context.data.text.split('').reverse().join('') + this.counter;
          }
        },
        cachedMultiParam: {
          params: {
            firstname: 'string',
            lastname: { type: 'string', optional: true }
          },
          cache: {
            keys: ['firstname', 'lastname']
          },
          handler (context) {
            this.counter = this.counter + 1;
            return `Hello ${context.data.firstname} ${context.data.lastname}! ${this.counter}`;
          }
        }
      },
      created () {
        this.counter = 0;
      }
    });

    node1.start();
  });
  afterEach(() => {
    node1.stop();
    clock.uninstall();
  });

  it('should clean cache items manually', () => {

  });
});
