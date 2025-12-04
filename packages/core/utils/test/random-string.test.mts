import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRandomString } from "../lib/random-string.mts";

describe("Random string generator", () => {
  it("should create random strings", () => {
    assert.notStrictEqual(createRandomString(), "");
    assert.strictEqual(createRandomString().length, 24);
    assert.strictEqual(createRandomString(24).length, 48);
  });
});
