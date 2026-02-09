import { createNode } from "../../helper/index.mts";
import MathService from "../../services/math.service.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ServiceSchema } from "../../../types/index.js";

describe("Transport", () => {
  it("should return results of all connected nodes.", (_t, done) => {
    const broker1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
        level: "fatal",
      },
      transport: {
        adapter: "dummy",
      },
    });

    const broker2 = createNode({
      nodeId: "node2",
      logger: {
        enabled: false,
        level: "fatal",
      },
      transport: {
        adapter: "dummy",
      },
    });

    broker1.createService(MathService as unknown as ServiceSchema);

    Promise.all([broker1.start(), broker2.start()])
      .then(() => broker1.waitForServices(["math"]))
      .then(() => broker2.call("math.add", { a: 1, b: 5 }))
      .then((res) => {
        assert.strictEqual(res, 6);
        done();
        return Promise.all([broker1.stop(), broker2.stop()]);
      });
  });
});
