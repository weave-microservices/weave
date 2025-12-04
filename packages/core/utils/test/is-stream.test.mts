import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { isStream } from "../lib/is-stream.mts";

describe("Is stream function", () => {
  it("should detect a stream object (true)", () => {
    const readableStream = new Readable();
    const result = isStream(readableStream);

    assert.strictEqual(result, true);
  });

  it("should detect a stream object (false)", () => {
    const readableStream = Buffer.from("1");
    const result = isStream(readableStream);

    assert.strictEqual(result, false);
  });
});
