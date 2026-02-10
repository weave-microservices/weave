import { createCacheBase } from "../../../lib/cache/adapters/base.mts";
import cacheMiddleware from "../../../lib/middlewares/cache/index.mts";
import { createFakeRuntime } from "../../helper/runtime.mts";
import { createNode } from "../../helper/index.mts";
import { WeaveError } from "../../../lib/errors.mts";
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { Runtime } from "../../../types/index.js";

describe("Test cache base errors", () => {
  const broker = createNode({
    logger: {
      enabled: false,
    },
  });

  it("should throw an error if the cache name is not a string.", () => {
    try {
      createCacheBase(null as unknown as string, broker.runtime, {}, {});
    } catch (error) {
      assert.strictEqual(error instanceof WeaveError, true);
      assert.strictEqual((error as Error).message, "Name must be a string.");
    }
  });
});

describe("Test cache hash creation", () => {
  const broker = createNode({
    logger: {
      enabled: false,
    },
  });
  const cacheBase = createCacheBase("a-name", broker.runtime, {}, {});

  it("should return the action name if no parameter was passed,", () => {
    const hash = cacheBase.getCachingKey("testAction", null, {});
    assert.deepStrictEqual(hash, "testAction.K+iMpCQsduglOsYkdIUQZQMtaDM=");
  });

  it("should return the hashed value for the request.", () => {
    const hash = cacheBase.getCachingKey("testAction", { a: 3, b: 2, c: "3" }, {});
    assert.deepStrictEqual(hash, "testAction.oL5syHSbxJsftXqJ7IaaqzuwmMU=");
    assert.strictEqual(hash.length, 39);
  });

  it("should return the hashed value for the request with all kind of types", () => {
    const hash = cacheBase.getCachingKey(
      "testAction",
      {
        a: 3,
        b: 2,
        c: "3",
        d: null,
        e: { a1: "asd", a2: 123, a3: { a1: 234, a2: true, a3: null, a4: Symbol("abc") } },
      },
      { user: { id: "1234" } },
      ["id", "d", "e", ":user.id"],
    );
    assert.deepStrictEqual(hash, "testAction.rSpCMtm5NKgVW72K90ZERJ380kU=");
    assert.strictEqual(hash.length, 39);
  });
});

describe("Test cache middleware", () => {
  const handler = mock.fn(() => Promise.resolve("hooray!!!"));
  const service = {};

  it("should be defined", () => {
    const runtime = createFakeRuntime({
      cache: {
        lock: {
          enabled: false,
        },
      },
    });
    const middleware = cacheMiddleware(runtime as unknown as Runtime);
    assert.notStrictEqual(middleware, undefined);
  });

  it("should not wrap handler if cache settings are not set", () => {
    const action = {
      name: "math.add",
      handler,
      service,
    };
    const runtime = createFakeRuntime({
      cache: {
        lock: {
          enabled: false,
        },
      },
    });

    const newHandler = cacheMiddleware(runtime as unknown as Runtime).localAction!(handler as any, action as any);
    assert.strictEqual(newHandler, handler);
  });

  it("should wrap handler if cache settings are set", () => {
    const action = {
      name: "math.add",
      cache: {
        keys: ["p"],
      },
      handler,
      service,
    };
    const runtime = createFakeRuntime({
      cache: {
        lock: {
          enabled: false,
        },
      },
    });
    // Add a cache property to runtime so the middleware wraps the handler
    (runtime as any).cache = {
      getCachingKey: mock.fn(() => "testKey"),
      get: mock.fn(() => Promise.resolve(null)),
      set: mock.fn(() => Promise.resolve()),
      isConnected: true,
    };
    const newHandler = cacheMiddleware(runtime as unknown as Runtime).localAction!(handler as any, action as any);
    assert.notStrictEqual(newHandler, handler);
  });
});
