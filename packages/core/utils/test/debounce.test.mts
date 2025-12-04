import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { debounce } from "../lib/debounce.mts";

describe("Debounce", () => {
  it("should debounce an action call", async () => {
    let callCount = 0;
    const func = () => {
      callCount++;
    };
    const debounceFunc = debounce(func, 100);

    // Call multiple times rapidly
    debounceFunc();
    debounceFunc();
    debounceFunc();

    // Should not have been called yet
    assert.strictEqual(callCount, 0);

    // Wait for debounce to complete
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should have been called once
    assert.strictEqual(callCount, 1);
  });

  it("should call immediately with immediate flag", async () => {
    let callCount = 0;
    const func = () => {
      callCount++;
    };
    const debounceFunc = debounce(func, 100, true);

    // Call immediately
    debounceFunc();
    assert.strictEqual(callCount, 1);

    // Call multiple times rapidly
    debounceFunc();
    debounceFunc();

    // Wait for debounce period
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should still be 1 (immediate call only)
    assert.strictEqual(callCount, 1);
  });
});
