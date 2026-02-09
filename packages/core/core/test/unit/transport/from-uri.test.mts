import parseURI from "../../../lib/transport/adapters/fromURI.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("URI parser", () => {
  it("should throw an error if the given value is not a string", () => {
    // @ts-expect-error Testing invalid input type
    const call = () => parseURI([]);
    assert.throws(call, { message: "URI needs to be a string." });
  });

  it("should throw an error if an unknown adapter is given.", () => {
    const call = () => parseURI("invalidAdapter://lcoalhost:27017");
    assert.throws(call, { message: "No adapter found." });
  });

  it("should throw an error if an unknown adapter is given.", () => {
    const call = () => parseURI("lcoalhost");
    assert.throws(call, { message: "Protocol is missing." });
  });

  it("should return an dummy adapter.", () => {
    const adapter = parseURI("dummy://lcoalhost:27017");
    assert.ok(adapter !== null);
    assert.strictEqual(typeof adapter, "object");
  });

  it("should return an TCP adapter.", () => {
    const adapter = parseURI("tcp://lcoalhost:27017");
    assert.ok(adapter !== null);
    assert.strictEqual(typeof adapter, "object");
  });
});
