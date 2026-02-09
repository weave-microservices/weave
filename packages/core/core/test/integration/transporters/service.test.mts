import { Errors } from "../../../lib/index.mts";
import { createNode } from "../../helper/index.mts";
import LocalService from "../../services/local.service.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { ServiceSchema } from "../../../types/index.js";

describe("Connected services", () => {
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

    broker1.createService(LocalService as unknown as ServiceSchema);

    Promise.all([broker1.start(), broker2.start()])
      .then(() => broker1.waitForServices(["local"]))
      .then(() => broker2.call("local.hidden", { text: "test" }))
      .catch((error) => {
        const expectedError = new Errors.WeaveServiceNotFoundError({ actionName: "local.hidden" });
        assert.deepStrictEqual(error, expectedError);
        done();
        return Promise.all([broker1.stop(), broker2.stop()]);
      });
  });
});
