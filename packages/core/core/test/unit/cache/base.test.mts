import { createCacheBase } from "../../../lib/cache/adapters/base.mts";
import { createNode } from "../../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { BrokerOptions } from "../../../types/index.js";

const config: BrokerOptions = {
  logger: {
    enabled: false,
  },
};

describe("Test base cache factory", () => {
  it("constructor.", () => {
    const broker = createNode(config);
    const baseCache = createCacheBase("a-name", broker.runtime, {}, {});
    assert.notStrictEqual(baseCache.log, undefined);
    assert.notStrictEqual(baseCache.set, undefined);
    assert.notStrictEqual(baseCache.get, undefined);
    assert.notStrictEqual(baseCache.remove, undefined);
    assert.notStrictEqual(baseCache.clear, undefined);
    assert.notStrictEqual(baseCache.options, undefined);
  });

  it("Options.", () => {
    const broker = createNode(config);
    const baseCache = createCacheBase("a-name", broker.runtime, {}, {});

    assert.strictEqual(baseCache.options.ttl, null);
  });

  it("Not implemented methods.", () => {
    const broker = createNode(config);
    const baseCache = createCacheBase("a-name", broker.runtime, {}, {});

    try {
      baseCache.set("abc", "def", 5000);
    } catch (error) {
      assert.strictEqual((error as Error).message, "Method not implemented.");
    }

    try {
      baseCache.get("abc");
    } catch (error) {
      assert.strictEqual((error as Error).message, "Method not implemented.");
    }

    try {
      baseCache.remove();
    } catch (error) {
      assert.strictEqual((error as Error).message, "Method not implemented.");
    }

    try {
      baseCache.clear();
    } catch (error) {
      assert.strictEqual((error as Error).message, "Method not implemented.");
    }
  });

  it("should generate a caching hash.", () => {
    const broker = createNode(config);
    const baseCache = createCacheBase("a-name", broker.runtime, {}, {});
    const hash = baseCache.getCachingKey("test.action", { name: "Kevin" }, {});
    assert.strictEqual(hash, "test.action.kqVWw7bW5t57pReZ6HUGiNt2oyo=");
  });

  it("should generate a caching hash (with 1 key)", () => {
    const broker = createNode(config);
    const baseCache = createCacheBase("a-name", broker.runtime, {}, {});
    const hash = baseCache.getCachingKey("test.action", { name: "Kevin", age: 19 }, {}, ["name"]);
    assert.strictEqual(hash, "test.action.M011mDHOLwLBkPUImS1jBg7XYcc=");
  });

  it("should generate a caching hash (with multiple keys)", () => {
    const broker = createNode(config);
    const baseCache = createCacheBase("a-name", broker.runtime, {}, {});
    const hash = baseCache.getCachingKey(
      "test.action",
      {
        name: "Kevin",
        age: 19,
        hobbies: ["coding", "gym", "swimming"],
        height: null,
        weight: undefined,
        date: new Date("2022-10-10"),
        settings: {
          enabled: true,
          appearance: {
            color: "red",
          },
        },
      },
      {
        user: {
          id: 123,
          sym: Symbol("ABC"),
        },
      },
      [
        "date",
        "name",
        "age",
        "hobbies",
        "height",
        "settings.appearance",
        "weight",
        ":user",
        "notDefined",
      ],
    );

    assert.strictEqual(hash, "test.action.VhzGreeraZI+Q9ykNPXRiNSB/qk=");
  });
});
