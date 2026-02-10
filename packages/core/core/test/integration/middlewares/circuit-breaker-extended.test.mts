import { TransportAdapters } from "../../../lib/index.mts";
import { WeaveError } from "../../../lib/errors.mts";
import { createNode } from "../../helper/index.mts";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

describe("Circuit-Breaker State Transitions", () => {
  it("should transition from CLOSED -> OPENED -> HALF_OPENED on success", async () => {
    const node = createNode({
      nodeId: "cb-state-node",
      logger: { enabled: false },
      circuitBreaker: {
        enabled: true,
        failureOnError: true,
        maxFailures: 2,
        halfOpenTimeout: 100, // Fast timeout for testing
      },
    });

    let callCount = 0;

    node.createService({
      name: "test",
      actions: {
        flaky() {
          callCount++;
          // Fail first 2 calls, then succeed
          if (callCount <= 2) {
            return Promise.reject(new WeaveError("Simulated failure"));
          }
          return "success";
        },
      },
    });

    await node.start();

    // First failure
    await assert.rejects(node.call("test.flaky"), { name: "WeaveError" });
    assert.strictEqual(callCount, 1);

    // Second failure - should open circuit
    await assert.rejects(node.call("test.flaky"), { name: "WeaveError" });
    assert.strictEqual(callCount, 2);

    // Third call - circuit is OPEN, should reject immediately
    await assert.rejects(node.call("test.flaky"), { name: "WeaveServiceNotAvailableError" });
    assert.strictEqual(callCount, 2); // Handler not called

    // Wait for half-open timeout
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Circuit is now HALF_OPENED, call should go through and succeed
    // Note: After this call the circuit enters HALF_OPEN_WAITING state until halfOpenTimeout
    const result = await node.call("test.flaky");
    assert.strictEqual(result, "success");
    assert.strictEqual(callCount, 3);

    // Wait for another half-open timeout to allow next request
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Circuit should allow another call
    const result2 = await node.call("test.flaky");
    assert.strictEqual(result2, "success");
    assert.strictEqual(callCount, 4);

    await node.stop();
  });

  it("should transition from HALF_OPENED back to OPENED on failure", async () => {
    const node = createNode({
      nodeId: "cb-halfopen-node",
      logger: { enabled: false },
      circuitBreaker: {
        enabled: true,
        failureOnError: true,
        maxFailures: 2,
        halfOpenTimeout: 100,
      },
    });

    let callCount = 0;

    node.createService({
      name: "test",
      actions: {
        alwaysFail() {
          callCount++;
          return Promise.reject(new WeaveError("Always fails"));
        },
      },
    });

    await node.start();

    // Trigger 2 failures to open the circuit
    await assert.rejects(node.call("test.alwaysFail"), { name: "WeaveError" });
    await assert.rejects(node.call("test.alwaysFail"), { name: "WeaveError" });
    assert.strictEqual(callCount, 2);

    // Circuit is OPEN
    await assert.rejects(node.call("test.alwaysFail"), { name: "WeaveServiceNotAvailableError" });

    // Wait for half-open
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Circuit is HALF_OPENED - this call will fail and re-open circuit
    await assert.rejects(node.call("test.alwaysFail"), { name: "WeaveError" });
    assert.strictEqual(callCount, 3);

    // Circuit should be OPEN again
    await assert.rejects(node.call("test.alwaysFail"), { name: "WeaveServiceNotAvailableError" });
    assert.strictEqual(callCount, 3); // Handler not called

    await node.stop();
  });
});

describe("Circuit-Breaker windowTime", () => {
  it("should reset failure counter after windowTime", async () => {
    const node = createNode({
      nodeId: "cb-window-node",
      logger: { enabled: false },
      circuitBreaker: {
        enabled: true,
        failureOnError: true,
        maxFailures: 3,
        halfOpenTimeout: 1000,
        windowTime: 200, // Reset counters every 200ms
      },
    });

    let shouldFail = true;

    node.createService({
      name: "test",
      actions: {
        conditional() {
          if (shouldFail) {
            return Promise.reject(new WeaveError("Failure"));
          }
          return "success";
        },
      },
    });

    await node.start();

    // Two failures (not enough to open circuit)
    await assert.rejects(node.call("test.conditional"), { name: "WeaveError" });
    await assert.rejects(node.call("test.conditional"), { name: "WeaveError" });

    // Wait for windowTime to reset counters
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Counter should be reset, we can fail again without opening circuit
    await assert.rejects(node.call("test.conditional"), { name: "WeaveError" });
    await assert.rejects(node.call("test.conditional"), { name: "WeaveError" });

    // Still should work (counter was reset)
    shouldFail = false;
    const result = await node.call("test.conditional");
    assert.strictEqual(result, "success");

    await node.stop();
  });
});

describe("Circuit-Breaker per-action configuration", () => {
  it("should use action-level circuit breaker settings", async () => {
    const node = createNode({
      nodeId: "cb-action-node",
      logger: { enabled: false },
      circuitBreaker: {
        enabled: true,
        failureOnError: true,
        maxFailures: 5, // Global: 5 failures
        halfOpenTimeout: 1000,
      },
    });

    node.createService({
      name: "test",
      actions: {
        strictAction: {
          circuitBreaker: {
            enabled: true,
            maxFailures: 1, // Action-level: only 1 failure allowed
            halfOpenTimeout: 100,
          },
          handler() {
            return Promise.reject(new WeaveError("Failure"));
          },
        },
      },
    });

    await node.start();

    // First failure should open circuit (action maxFailures = 1)
    await assert.rejects(node.call("test.strictAction"), { name: "WeaveError" });

    // Circuit should be open now
    await assert.rejects(node.call("test.strictAction"), { name: "WeaveServiceNotAvailableError" });

    await node.stop();
  });

  it("should disable circuit breaker when action.circuitBreaker.enabled is false", async () => {
    const node = createNode({
      nodeId: "cb-disabled-node",
      logger: { enabled: false },
      circuitBreaker: {
        enabled: true,
        failureOnError: true,
        maxFailures: 1,
      },
    });

    let callCount = 0;

    node.createService({
      name: "test",
      actions: {
        noCB: {
          circuitBreaker: {
            enabled: false,
          },
          handler() {
            callCount++;
            return Promise.reject(new WeaveError("Failure"));
          },
        },
      },
    });

    await node.start();

    // Multiple failures should not open circuit because it's disabled for this action
    await assert.rejects(node.call("test.noCB"), { name: "WeaveError" });
    await assert.rejects(node.call("test.noCB"), { name: "WeaveError" });
    await assert.rejects(node.call("test.noCB"), { name: "WeaveError" });

    // All calls should reach the handler
    assert.strictEqual(callCount, 3);

    await node.stop();
  });
});

describe("Circuit-Breaker with remote nodes", () => {
  const node1 = createNode({
    nodeId: "cb-remote-node1",
    logger: { enabled: false },
    transport: { adapter: TransportAdapters.Dummy() },
    circuitBreaker: {
      enabled: true,
      failureOnError: true,
      maxFailures: 2,
      halfOpenTimeout: 100,
    },
  });

  const node2 = createNode({
    nodeId: "cb-remote-node2",
    logger: { enabled: false },
    transport: { adapter: TransportAdapters.Dummy() },
  });

  let callCount = 0;

  before(async () => {
    node2.createService({
      name: "remote",
      actions: {
        fail() {
          callCount++;
          return Promise.reject(new WeaveError("Remote failure"));
        },
      },
    });

    await node1.start();
    await node2.start();
  });

  after(async () => {
    await node1.stop();
    await node2.stop();
  });

  it("should track circuit breaker state per endpoint", async () => {
    // Trigger failures to open circuit
    await assert.rejects(node1.call("remote.fail"), { name: "WeaveError" });
    await assert.rejects(node1.call("remote.fail"), { name: "WeaveError" });
    assert.strictEqual(callCount, 2);

    // Circuit is open for remote endpoint
    await assert.rejects(node1.call("remote.fail"), { name: "WeaveServiceNotAvailableError" });
    assert.strictEqual(callCount, 2); // No additional calls

    // Wait for half-open
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Should try again in half-open state
    await assert.rejects(node1.call("remote.fail"), { name: "WeaveError" });
    assert.strictEqual(callCount, 3);
  });
});

describe("Circuit-Breaker concurrent requests during state transitions", () => {
  it("should handle concurrent requests during half-open state", async () => {
    const node = createNode({
      nodeId: "cb-concurrent-node",
      logger: { enabled: false },
      circuitBreaker: {
        enabled: true,
        failureOnError: true,
        maxFailures: 2,
        halfOpenTimeout: 100,
      },
    });

    let callCount = 0;

    node.createService({
      name: "test",
      actions: {
        slow() {
          callCount++;
          return new Promise((resolve) => setTimeout(() => resolve("done"), 50));
        },
        fail() {
          callCount++;
          return Promise.reject(new WeaveError("Failure"));
        },
      },
    });

    await node.start();

    // Open the circuit
    await assert.rejects(node.call("test.fail"), { name: "WeaveError" });
    await assert.rejects(node.call("test.fail"), { name: "WeaveError" });

    // Wait for half-open
    await new Promise((resolve) => setTimeout(resolve, 150));

    // Launch concurrent requests during half-open
    // Only one should be allowed through, others should wait or be rejected
    const results = await Promise.allSettled([
      node.call("test.slow"),
      node.call("test.slow"),
      node.call("test.slow"),
    ]);

    // At least one should succeed
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    assert.ok(successCount >= 1, "At least one request should succeed");

    await node.stop();
  });
});
