import { createNode } from "../helper/index.mts";
import { describe, it, afterEach, mock } from "node:test";
import assert from "node:assert/strict";
import type { Broker } from "../../types/index.js";

describe("Metrics Error Handling with Promise.allSettled()", () => {
  let broker: Broker;

  afterEach(async () => {
    if (broker && broker.runtime.state.isStarted) {
      await broker.stop();
    }
  });

  describe("Metrics adapter stop failures", () => {
    it("should handle multiple metrics adapter stop failures gracefully", async () => {
      const mockAdapter1 = {
        init: mock.fn(),
        stop: mock.fn(() => Promise.reject(new Error("Adapter 1 stop failed"))),
      };

      const mockAdapter2 = {
        init: mock.fn(),
        stop: mock.fn(() => Promise.reject(new Error("Adapter 2 stop failed"))),
      };

      const mockAdapter3 = {
        init: mock.fn(),
        stop: mock.fn(() => Promise.resolve()),
      };

      broker = createNode({
        nodeId: "metrics-error-test",
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [mockAdapter1, mockAdapter2, mockAdapter3],
        },
      });

      await broker.start();

      // Should complete stop despite adapter failures
      await assert.doesNotReject(broker.stop());

      assert.strictEqual(mockAdapter1.stop.mock.calls.length, 1);
      assert.strictEqual(mockAdapter2.stop.mock.calls.length, 1);
      assert.strictEqual(mockAdapter3.stop.mock.calls.length, 1);
    });

    it("should handle single metrics adapter stop failure", async () => {
      const mockAdapter = {
        init: mock.fn(),
        stop: mock.fn(() => Promise.reject(new Error("Single adapter stop failed"))),
      };

      broker = createNode({
        nodeId: "single-metrics-error-test",
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [mockAdapter],
        },
      });

      await broker.start();

      // Should complete stop despite adapter failure
      await assert.doesNotReject(broker.stop());
      assert.strictEqual(mockAdapter.stop.mock.calls.length, 1);
    });

    it("should handle mixed success and failure in metrics adapters", async () => {
      const successAdapter = {
        init: mock.fn(),
        stop: mock.fn(() => Promise.resolve()),
      };

      const failureAdapter = {
        init: mock.fn(),
        stop: mock.fn(() => Promise.reject(new Error("Adapter failure"))),
      };

      broker = createNode({
        nodeId: "mixed-metrics-test",
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [successAdapter, failureAdapter],
        },
      });

      await broker.start();
      await assert.doesNotReject(broker.stop());

      assert.strictEqual(successAdapter.stop.mock.calls.length, 1);
      assert.strictEqual(failureAdapter.stop.mock.calls.length, 1);
    });

    it("should handle metrics stop when no adapters are configured", async () => {
      broker = createNode({
        nodeId: "no-adapters-test",
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [],
        },
      });

      await broker.start();
      await assert.doesNotReject(broker.stop());
    });

    it("should handle metrics stop when adapters is undefined", async () => {
      broker = createNode({
        nodeId: "undefined-adapters-test",
        logger: { enabled: false },
        metrics: {
          enabled: true,
        },
      });

      await broker.start();
      await assert.doesNotReject(broker.stop());
    });
  });

  describe("Metrics initialization errors", () => {
    it("should handle metrics adapter validation errors", () => {
      assert.throws(() => {
        broker = createNode({
          nodeId: "metrics-validation-test",
          logger: { enabled: false },
          metrics: {
            enabled: true,
            adapters: "not-an-array" as any, // Should cause validation error
          },
        });
      }, /Metic adapter needs to be an Array/);
    });

    it("should handle successful metrics operations", async () => {
      const mockAdapter = {
        init: mock.fn(),
        stop: mock.fn(() => Promise.resolve()),
      };

      broker = createNode({
        nodeId: "successful-metrics-test",
        logger: { enabled: false },
        metrics: {
          enabled: true,
          adapters: [mockAdapter],
        },
      });

      await broker.start();

      // Register a test metric
      const metric = broker.runtime.metrics?.register({
        type: "counter",
        name: "test.counter",
        description: "Test counter",
      });

      assert.notStrictEqual(metric, undefined);

      await broker.stop();
      assert.strictEqual(mockAdapter.stop.mock.calls.length, 1);
    });
  });
});
