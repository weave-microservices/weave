import { createNode } from "../../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { WeaveError } from "../../../lib/errors.mts";

describe("Bulkhead concurrent limiting", () => {
  it("should limit concurrent calls to configured value", async () => {
    const node = createNode({
      nodeId: "bulkhead-concurrent",
      logger: { enabled: false },
      bulkhead: {
        enabled: true,
        concurrentCalls: 2,
        maxQueueSize: 10,
      },
    });

    let activeCount = 0;
    let maxActive = 0;

    node.createService({
      name: "test",
      actions: {
        slow() {
          activeCount++;
          maxActive = Math.max(maxActive, activeCount);
          return new Promise((resolve) => {
            setTimeout(() => {
              activeCount--;
              resolve(true);
            }, 50);
          });
        },
      },
    });

    await node.start();

    // Launch 5 concurrent requests
    await Promise.all([
      node.call("test.slow"),
      node.call("test.slow"),
      node.call("test.slow"),
      node.call("test.slow"),
      node.call("test.slow"),
    ]);

    // Maximum concurrent should be limited to 2
    assert.ok(maxActive <= 2, `Expected max 2 concurrent calls, got ${maxActive}`);

    await node.stop();
  });

  it("should queue requests when concurrent limit is reached", async () => {
    const node = createNode({
      nodeId: "bulkhead-queue",
      logger: { enabled: false },
      bulkhead: {
        enabled: true,
        concurrentCalls: 1,
        maxQueueSize: 10,
      },
    });

    const executionOrder: number[] = [];

    node.createService({
      name: "test",
      actions: {
        ordered(context) {
          const order = (context.data as { order: number }).order;
          return new Promise((resolve) => {
            setTimeout(() => {
              executionOrder.push(order);
              resolve(order);
            }, 20);
          });
        },
      },
    });

    await node.start();

    // Launch requests that should be executed in order due to queue
    await Promise.all([
      node.call("test.ordered", { order: 1 }),
      node.call("test.ordered", { order: 2 }),
      node.call("test.ordered", { order: 3 }),
    ]);

    // All should complete successfully
    assert.strictEqual(executionOrder.length, 3);
    // First should be 1 (executed immediately)
    assert.strictEqual(executionOrder[0], 1);

    await node.stop();
  });
});

describe("Bulkhead queue overflow", () => {
  it("should reject requests when queue is full", async () => {
    const node = createNode({
      nodeId: "bulkhead-overflow",
      logger: { enabled: false },
      bulkhead: {
        enabled: true,
        concurrentCalls: 1,
        maxQueueSize: 2,
      },
    });

    node.createService({
      name: "test",
      actions: {
        slow() {
          return new Promise((resolve) => {
            setTimeout(() => resolve(true), 100);
          });
        },
      },
    });

    await node.start();

    // Launch more requests than can be handled
    // 1 executing + 2 in queue = 3 allowed, 4th should fail
    const results = await Promise.allSettled([
      node.call("test.slow"),
      node.call("test.slow"),
      node.call("test.slow"),
      node.call("test.slow"),
      node.call("test.slow"),
    ]);

    const rejected = results.filter((r) => r.status === "rejected");
    const fulfilled = results.filter((r) => r.status === "fulfilled");

    // At least some should be rejected
    assert.ok(rejected.length > 0, "Expected some requests to be rejected");

    // Check that rejected requests have correct error
    for (const result of rejected) {
      const error = (result as PromiseRejectedResult).reason as WeaveError;
      assert.strictEqual(error.code, "WEAVE_QUEUE_SIZE_EXCEEDED_ERROR");
      assert.strictEqual(error.retryable, false);
    }

    // Fulfilled requests should all succeed
    for (const result of fulfilled) {
      assert.strictEqual((result as PromiseFulfilledResult<unknown>).value, true);
    }

    await node.stop();
  });

  it("should provide detailed error data when queue overflows", async () => {
    const node = createNode({
      nodeId: "bulkhead-error-data",
      logger: { enabled: false },
      bulkhead: {
        enabled: true,
        concurrentCalls: 1,
        maxQueueSize: 1,
      },
    });

    node.createService({
      name: "myService",
      actions: {
        slow() {
          return new Promise((resolve) => {
            setTimeout(() => resolve(true), 500);
          });
        },
      },
    });

    await node.start();

    // With concurrentCalls=1, maxQueueSize=1:
    // - 1st call executes immediately
    // - 2nd call goes to queue (queue.length=1)
    // - 3rd call: check is maxQueueSize(1) < queue.length(1) = false, so it adds to queue
    // - 4th call: check is maxQueueSize(1) < queue.length(2) = true, so it rejects
    const results = await Promise.allSettled([
      node.call("myService.slow"),
      node.call("myService.slow"),
      node.call("myService.slow"),
      node.call("myService.slow"),
    ]);

    const rejected = results.find((r) => r.status === "rejected");
    assert.ok(rejected, "Expected at least one rejected request");

    const error = (rejected as PromiseRejectedResult).reason as WeaveError;
    const errorData = error.data as { action: string; limit: number; size: number };
    assert.strictEqual(errorData.action, "myService.slow");
    assert.strictEqual(errorData.limit, 1);
    assert.strictEqual(typeof errorData.size, "number");

    await node.stop();
  });
});

describe("Bulkhead error handling in queue", () => {
  it("should handle errors from queued requests correctly", async () => {
    const node = createNode({
      nodeId: "bulkhead-errors",
      logger: { enabled: false },
      bulkhead: {
        enabled: true,
        concurrentCalls: 1,
        maxQueueSize: 10,
      },
    });

    node.createService({
      name: "test",
      actions: {
        mayFail(context) {
          const shouldFail = (context.data as { fail: boolean }).fail;
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (shouldFail) {
                reject(new WeaveError("Intentional failure"));
              } else {
                resolve("success");
              }
            }, 20);
          });
        },
      },
    });

    await node.start();

    const results = await Promise.allSettled([
      node.call("test.mayFail", { fail: false }),
      node.call("test.mayFail", { fail: true }),
      node.call("test.mayFail", { fail: false }),
    ]);

    // First and third should succeed
    assert.strictEqual(results[0].status, "fulfilled");
    assert.strictEqual((results[0] as PromiseFulfilledResult<unknown>).value, "success");

    // Second should fail with our error
    assert.strictEqual(results[1].status, "rejected");
    assert.strictEqual(
      ((results[1] as PromiseRejectedResult).reason as Error).message,
      "Intentional failure",
    );

    // Third should still succeed after error in second
    assert.strictEqual(results[2].status, "fulfilled");
    assert.strictEqual((results[2] as PromiseFulfilledResult<unknown>).value, "success");

    await node.stop();
  });

  it("should continue processing queue after error", async () => {
    const node = createNode({
      nodeId: "bulkhead-continue",
      logger: { enabled: false },
      bulkhead: {
        enabled: true,
        concurrentCalls: 1,
        maxQueueSize: 10,
      },
    });

    let callCount = 0;

    node.createService({
      name: "test",
      actions: {
        counting() {
          callCount++;
          const currentCall = callCount;
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              // Fail on second call
              if (currentCall === 2) {
                reject(new WeaveError("Second call fails"));
              } else {
                resolve(currentCall);
              }
            }, 10);
          });
        },
      },
    });

    await node.start();

    const results = await Promise.allSettled([
      node.call("test.counting"),
      node.call("test.counting"),
      node.call("test.counting"),
      node.call("test.counting"),
    ]);

    // All requests should have been processed
    assert.strictEqual(callCount, 4);

    // Check results
    assert.strictEqual(results[0].status, "fulfilled");
    assert.strictEqual(results[1].status, "rejected");
    assert.strictEqual(results[2].status, "fulfilled");
    assert.strictEqual(results[3].status, "fulfilled");

    await node.stop();
  });
});

describe("Bulkhead per-action isolation", () => {
  it("should maintain separate queues per action", async () => {
    const node = createNode({
      nodeId: "bulkhead-isolation",
      logger: { enabled: false },
      bulkhead: {
        enabled: true,
        concurrentCalls: 1,
        maxQueueSize: 5,
      },
    });

    let action1Active = 0;
    let action2Active = 0;
    let action1Max = 0;
    let action2Max = 0;

    node.createService({
      name: "test",
      actions: {
        action1() {
          action1Active++;
          action1Max = Math.max(action1Max, action1Active);
          return new Promise((resolve) => {
            setTimeout(() => {
              action1Active--;
              resolve("action1");
            }, 30);
          });
        },
        action2() {
          action2Active++;
          action2Max = Math.max(action2Max, action2Active);
          return new Promise((resolve) => {
            setTimeout(() => {
              action2Active--;
              resolve("action2");
            }, 30);
          });
        },
      },
    });

    await node.start();

    // Launch concurrent requests to both actions
    await Promise.all([
      node.call("test.action1"),
      node.call("test.action1"),
      node.call("test.action2"),
      node.call("test.action2"),
    ]);

    // Each action should have its own concurrency limit
    assert.ok(action1Max <= 1, `Expected action1 max 1 concurrent, got ${action1Max}`);
    assert.ok(action2Max <= 1, `Expected action2 max 1 concurrent, got ${action2Max}`);

    await node.stop();
  });
});

describe("Bulkhead disabled", () => {
  it("should allow unlimited concurrent calls when disabled", async () => {
    const node = createNode({
      nodeId: "bulkhead-disabled",
      logger: { enabled: false },
      bulkhead: {
        enabled: false,
        concurrentCalls: 1,
        maxQueueSize: 1,
      },
    });

    let activeCount = 0;
    let maxActive = 0;

    node.createService({
      name: "test",
      actions: {
        slow() {
          activeCount++;
          maxActive = Math.max(maxActive, activeCount);
          return new Promise((resolve) => {
            setTimeout(() => {
              activeCount--;
              resolve(true);
            }, 50);
          });
        },
      },
    });

    await node.start();

    // Launch many concurrent requests
    await Promise.all(Array.from({ length: 10 }, () => node.call("test.slow")));

    // All should run concurrently since bulkhead is disabled
    assert.ok(
      maxActive > 1,
      `Expected more than 1 concurrent call when disabled, got ${maxActive}`,
    );

    await node.stop();
  });
});
