import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { promiseDelay } from "../lib/promise-delay.mts";

describe("Promise delay wrapper", () => {
  it("should resolve a promise delayed", async () => {
    const p = Promise.resolve("value");
    const delayed = promiseDelay(p, 100);
    const result = await delayed;
    assert.strictEqual(result, "value");
  });
});
