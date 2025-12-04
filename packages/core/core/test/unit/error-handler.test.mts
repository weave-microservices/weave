import * as Errors from "../../lib/errors.mts";
import { describe, it, after } from "node:test";
import assert from "node:assert/strict";

describe("Test error handler", () => {
  const realProcessExit = process.exit;
  process.exit = (() => {
    throw Error();
  }) as any;
  after(() => {
    process.exit = realProcessExit;
  });
  it("Default weave error", () => {
    const error = new Errors.WeaveError("Fatal error!", {
      code: "DEFAULT_ERROR",
      data: { empty: "no_data" },
    });
    assert.notStrictEqual(error, undefined);
    assert.ok(error instanceof Errors.WeaveError);
    assert.strictEqual(error.message, "Fatal error!");
    assert.strictEqual(error.code, "DEFAULT_ERROR");
    assert.deepStrictEqual(error.data, { empty: "no_data" });
    assert.strictEqual(error.retryable, false);
  });
});
