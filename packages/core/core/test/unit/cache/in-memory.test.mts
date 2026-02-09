import { createInMemoryCache } from "../../../lib/cache/adapters/index.mts";
import { createNode } from "../../helper/index.mts";
// import SlowService from '../../services/slow.service.mts';
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";

describe("Test IN-Memory cache initialization", () => {
  it("should create with default options.", () => {
    const broker = createNode({
      logger: {
        enabled: false,
      },
    });
    const cache = createInMemoryCache()(broker.runtime);
    assert.notStrictEqual(cache.options, undefined);
    assert.strictEqual(cache.options.ttl, null);
    cache.stop();
  });

  it("should create with options.", () => {
    const options = { ttl: 4000 };
    const broker = createNode({
      logger: {
        enabled: false,
      },
    });
    const cache = createInMemoryCache()(broker.runtime, options);
    assert.deepStrictEqual(cache.options, options);
    assert.strictEqual(cache.options.ttl, 4000);
    cache.stop();
  });

  it("should create with options.", () => {
    const options = { ttl: 4000 };
    const broker = createNode({
      logger: {
        enabled: false,
      },
    });
    const cache = createInMemoryCache()(broker.runtime, options);
    assert.deepStrictEqual(cache.options, options);
    assert.strictEqual(cache.options.ttl, 4000);
    cache.stop();
  });
});

describe("Test IN-Memory message flow", () => {
  it('should call "clear" after a new node is connected.', () => {
    const broker = createNode({
      logger: {
        enabled: false,
      },
    });

    const cache = createInMemoryCache()(broker.runtime);
    cache.init();
    const clearMock = mock.fn(() => Promise.resolve());
    (cache as unknown as { clear: typeof clearMock }).clear = clearMock;
    broker.bus.emit("$transport.connected");
    assert.strictEqual(clearMock.mock.callCount(), 1);
    cache.stop();
  });
});

describe("Test usage (without TTL)", () => {
  const broker = createNode({
    logger: {
      enabled: false,
    },
  });
  const cache = createInMemoryCache()(broker.runtime);
  cache.init();

  const key1 = "test1234:sadasda";
  const key2 = "test12345:sadasdasadasdasd";

  const result = {
    data: ["Hello", "my", "friend"],
  };
  it("should save date with the key.", async () => {
    await cache.set(key1, result);
    const res = await cache.get(key1);
    assert.notStrictEqual(res, undefined);
    assert.deepStrictEqual(res, result);
  });

  it("should save date with the key.", async () => {
    await cache.set(key1, result);
    const res = await cache.get(key1);
    assert.notStrictEqual(res, undefined);
    assert.deepStrictEqual(res, result);
  });

  it("should delete data by key.", async () => {
    await cache.remove(key1);
    const res = await cache.get(key1);
    assert.notStrictEqual(res, undefined);
    assert.strictEqual(res, null);
  });

  it("should clear the cache.", async () => {
    await cache.set(key1, result);
    await cache.set(key2, result);

    await cache.clear();

    const res = await cache.get(key1);
    assert.notStrictEqual(res, undefined);
    assert.strictEqual(res, null);
  });

  it("should clear the cache partial.", async () => {
    cache.set(key1, result);
    cache.set(key2, result);

    cache.clear("test12345*");

    const res1 = await cache.get(key1);
    assert.notStrictEqual(res1, undefined);
    assert.deepStrictEqual(res1, res1);

    const res2 = await cache.get(key2);
    assert.strictEqual(res2, null);
  });
});

// describe('Test usage with TTL', () => {
//     const broker = createNode()
//     const options = { ttl: 3000 }
//     const cache = CacheMemory(broker)
//     cache.init()

//     const key1 = 'test1234:sadasda'
//     const key2 = 'test12345:sadasdasadasdasd'

//     const result = {
//         data: [
//             'Hello',
//             'my',
//             'friend'
//         ]
//     }
// })
