import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { clone } from "../lib/clone.mts";

class TestClass {
  fire() {}
}

describe("Object clone method", () => {
  it("should clone an object", () => {
    const source = {
      name: "test",
      actions: {
        help() {},
      },
      settings: new TestClass(),
      arrs: [1, 2, 3, 4, 5],
    };

    const newObject = clone(source);
    assert.deepStrictEqual(source, newObject);
    assert.strictEqual(typeof source.settings.fire, "function");
  });
});
