import * as Module from "../lib/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Module interface", () => {
  it("should have properties", () => {
    assert.notStrictEqual(Module.Cache, undefined);
    assert.notStrictEqual(Module.Constants, undefined);
    assert.notStrictEqual(Module.Errors, undefined);
    assert.notStrictEqual(Module.TracingAdapters, undefined);
    assert.notStrictEqual(Module.TransportAdapters, undefined);
    assert.notStrictEqual(Module.Weave, undefined);
    assert.notStrictEqual(Module.createBroker, undefined);
    assert.notStrictEqual(Module.defaultOptions, undefined);
    assert.notStrictEqual(Module.defineAction, undefined);
    assert.notStrictEqual(Module.defineBrokerOptions, undefined);
    assert.notStrictEqual(Module.defineService, undefined);
    assert.notStrictEqual(Module.createBaseTracingCollector, undefined);
  });
});
