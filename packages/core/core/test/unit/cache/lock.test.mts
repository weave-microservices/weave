import { createLock } from "../../../lib/cache/lock.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Test local cache lock", () => {
  it("should create with default options.", () => {
    const key = "test";
    const lock = createLock();
    return lock.acquire(key).then(() => {
      expect(lock.isLocked(key)).toBeTruthy();
      return lock.release(key).then(() => {
        expect(lock.isLocked(key)).toBeFalsy();
      });
    });
  });
});
