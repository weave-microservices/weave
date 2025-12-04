import MetricMiddleware from "../../../lib/middlewares/metrics.mts";
import { middlewareHooks } from "../../helper/constants.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Test metric middleware", () => {
  it("should create a middleware", () => {
    const fakeRuntime = {
      metrics: {},
      options: {
        metrics: {
          enabled: true,
        },
      },
    };

    const middleware = MetricMiddleware(fakeRuntime);
    const valid = Object.keys(middleware).every((p) => middlewareHooks.includes(p));
    assert.strictEqual(valid, true);
  });
});
