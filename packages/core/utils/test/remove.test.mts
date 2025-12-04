import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { remove } from "../lib/remove.mts";

describe("Remove", () => {
  it("should remove items from array", () => {
    const nums = [-1, 3, -3, -4, 5, 0, 7];

    const removedItems = remove(nums, function (n) {
      return n <= 0;
    });

    assert.deepStrictEqual(removedItems, [0, -4, -3, -1]);
    assert.deepStrictEqual(nums, [3, 5, 7]);
  });
});
