import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compact } from "../lib/compact.mts";

describe("Compact function", () => {
  it("should create an array with all falsey values removed", () => {
    const array = [1, 2, 3, 4, 5, false, true, undefined, "Test", { name: "compact" }];
    const result = compact(array);
    assert.deepStrictEqual(result, [1, 2, 3, 4, 5, true, "Test", { name: "compact" }]);
  });
});
