import { createCacheBase } from "../../../lib/cache/adapters/base.mts";
import cacheMiddleware from "../../../lib/middlewares/cache.mts";
import { createFakeRuntime } from "../../helper/runtime.mts";
import { createNode } from "../../helper/index.mts";
import { WeaveError } from "../../../lib/errors.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Test cache base errors", () => {
  const broker = createNode({
    logger: {
      enabled: false,
    },
  });

  it("should throw an error if the cache name is not a string.", () => {
    try {
      createCacheBase(broker, {});
    } catch (error) {
      assert.strictEqual(error instanceof WeaveError, true);
      assert.strictEqual(error.message, "Name must be a string.");
    }
  });
});

describe("Test cache hash creation", () => {
  const broker = createNode({
    logger: {
      enabled: false,
    },
  });
  const cacheBase = createCacheBase("a-name", broker, {});

  it("should return the action name if no parameter was passed,", () => {
    const hash = cacheBase.getCachingKey("testAction");
    assert.deepStrictEqual(hash, "testAction");
  });

  it("should return the hashed value for the request.", () => {
    const hash = cacheBase.getCachingKey("testAction", { a: 3, b: 2, c: "3" });
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
  const handler = jest.fn(() => Promise.resolve("hooray!!!"));
  const service = {};

  it("should be defined", () => {
    const action = {
      name: "math.add",
      handler,
      service,
    };
    const middleware = cacheMiddleware(handler, action);
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

    const newHandler = cacheMiddleware(runtime).localAction(handler, action);
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
    const newHandler = cacheMiddleware(handler, action);
    expect(newHandler).not.toBe(handler);
  });
});
