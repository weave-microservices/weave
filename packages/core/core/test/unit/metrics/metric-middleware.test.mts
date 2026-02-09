import MetricMiddleware from "../../../lib/middlewares/metrics/index.mts";
import { middlewareHooks } from "../../helper/constants.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Runtime } from "../../../types/internal.js";

describe("Test metric middleware", () => {
  it("should create a middleware", () => {
    const fakeRuntime = {
      metrics: {},
      options: {
        metrics: {
          enabled: true,
        },
      },
    } as unknown as Runtime;

    const middleware = MetricMiddleware(fakeRuntime);
    const valid = Object.keys(middleware).every((p) => middlewareHooks.includes(p));
    assert.strictEqual(valid, true);
  });
});
