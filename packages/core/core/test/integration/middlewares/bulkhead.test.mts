import { createNode } from "../../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WeaveError } from "../../../lib/errors.mts";
describe("Test bulkhead middleware", () => {
  it("should throw an error if the bulkhead queue exceeds", async () => {
    const broker = createNode({
      bulkhead: {
        enabled: true,
        maxQueueSize: 20,
      },
    });

    broker.createService({
      name: "pusher1",
      actions: {
        push() {
          return new Promise((resolve) => {
            setTimeout(() => resolve(true), 2000);
          });
        },
      },
    });

    await broker.start();
    try {
      await Promise.all(
        Array.from(Array(25), (_, x) => x).map((i) => {
          return broker.call("pusher1.push");
        }),
      );
    } catch (error) {
      assert.ok(error instanceof WeaveError);
      assert.strictEqual(error.code, "WEAVE_QUEUE_SIZE_EXCEEDED_ERROR");
      assert.strictEqual(error.retryable, false);
      assert.strictEqual(error.message, "Queue size limit was exceeded. Request rejected.");
      assert.deepStrictEqual(error.data, {
        action: "pusher1.push",
        limit: 20,
        size: 21,
      });
    }
    await broker.stop();
  });
});
