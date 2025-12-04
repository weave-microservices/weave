import messageTypes from "../../../lib/transport/messageTypes.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Message types", () => {
  it("should return defined message types", () => {
    assert.notStrictEqual(messageTypes.MESSAGE_DISCONNECT, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_DISCOVERY, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_EVENT, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_HEARTBEAT, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_INFO, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_PONG, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_REQUEST, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_RESPONSE, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_RESPONSE_STREAM_BACKPRESSURE, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_RESPONSE_STREAM_RESUME, undefined);
    assert.notStrictEqual(messageTypes.MESSAGE_UNKNOWN, undefined);
  });
});
