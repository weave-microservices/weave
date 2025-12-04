import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { promiseTimeout } from "../lib/promise-timeout.mts";

describe("Promise timeout wrapper", () => {
  it("should reject a promise after timeout", async () => {
    const p = new Promise((resolve) => {
      setTimeout(() => resolve("value"), 1000);
    });

    const timedPromise = promiseTimeout(100, p);

    await assert.rejects(timedPromise, {
      message: "Promise timed out.",
    });
  });

  it("should resolve a promise before timeout", async () => {
    const p = new Promise((resolve) => {
      setTimeout(() => resolve("value"), 100);
    });

    const timedPromise = promiseTimeout(200, p);
    const result = await timedPromise;
    assert.strictEqual(result, "value");
  });
});
