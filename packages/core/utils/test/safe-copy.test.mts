import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { safeCopy } from "../lib/safe-copy.mts";

describe("Safe copy function", () => {
  it("should safely copy object without functions", () => {
    const source = {
      a: 5,
      b: "Hello",
      c: [0, 1, 2],
      d: {
        e: false,
        f: 1.23,
      },
      h: (ctx: unknown) => ctx,
    };

    const result = safeCopy(source);
    assert.notStrictEqual(result, source);
    assert.deepStrictEqual(result, {
      a: 5,
      b: "Hello",
      c: [0, 1, 2],
      d: {
        e: false,
        f: 1.23,
      },
    });
  });
});
