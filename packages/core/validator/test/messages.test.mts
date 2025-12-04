import { describe, it } from "node:test";
import assert from "node:assert/strict";
import messages from "../lib/messages.mts";

describe("Messages", () => {
  it("should export default messages", () => {
    assert.ok(messages);
    assert.equal(typeof messages, "object");
  });

  it("should have required message", () => {
    assert.ok(messages.required);
    assert.equal(typeof messages.required, "string");
  });

  it("should have string message", () => {
    assert.ok(messages.string);
    assert.equal(typeof messages.string, "string");
  });

  it("should have number message", () => {
    assert.ok(messages.number);
    assert.equal(typeof messages.number, "string");
  });
});
