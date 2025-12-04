import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createEventEmitter } from "../lib/event-bus.mts";

describe("Event bus", () => {
  it("should create an event bus", () => {
    const result = createEventEmitter();
    assert.ok(result.on);
    assert.ok(result.emit);
  });
});
