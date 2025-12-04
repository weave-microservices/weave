import { initServiceManager } from "../../../lib/runtime/initServiceManager.mts";
import { createFakeRuntime } from "../../helper/runtime.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Test service manager init.", () => {
  it("should attach service utilities to runtime.", () => {
    const runtime = createFakeRuntime();

    initServiceManager(runtime);

    assert.notStrictEqual(runtime.services, undefined);
    assert.notStrictEqual(runtime.services.serviceList, undefined);
    assert.notStrictEqual(runtime.services.destroyService, undefined);
    assert.notStrictEqual(runtime.services.serviceChanged, undefined);
    assert.notStrictEqual(runtime.services.waitForServices, undefined);
  });
});
