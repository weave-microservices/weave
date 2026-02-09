import { createNode } from "../helper/index.mts";
import serviceHookMixin from "./mixins/service-hook.mixin.mts";
import { describe, it, test, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { Broker } from "../../types/index.js";

describe("Service Error Handling with Promise.allSettled()", () => {
  let broker: Broker;

  afterEach(async () => {
    if (broker && broker.runtime.state.isStarted) {
      await broker.stop();
    }
  });

  describe("Multiple service start failures", () => {
    it("should handle multiple service start failures gracefully", async () => {
      broker = createNode({
        nodeId: "multi-service-test",
        logger: { enabled: false },
      });

      // Create services with different failure scenarios
      broker.createService({
        name: "service1",
        mixins: [serviceHookMixin("started")],
        critical: true,
      });

      broker.createService({
        name: "service2",
        mixins: [serviceHookMixin("started")],
        critical: true,
      });

      broker.createService({
        name: "service3",
        started() {
          // This service starts successfully
          return Promise.resolve();
        },
      });

      await assert.rejects(broker.start(), /Failed to start 2 of 3 services/);
    });

    it("should preserve original error for single service failure", async () => {
      broker = createNode({
        nodeId: "single-service-test",
        logger: { enabled: false },
      });

      broker.createService({
        name: "failingService",
        mixins: [serviceHookMixin("started")],
      });

      await assert.rejects(broker.start(), /Rejected hook from started/);
    });

    it("should continue startup when only non-critical services fail", async () => {
      broker = createNode({
        nodeId: "non-critical-test",
        logger: { enabled: false },
      });

      broker.createService({
        name: "criticalService",
        critical: true,
        started() {
          return Promise.resolve();
        },
      });

      broker.createService({
        name: "nonCriticalService",
        critical: false,
        mixins: [serviceHookMixin("started")],
      });

      // Should start successfully despite non-critical service failure
      await broker.start();
      assert.strictEqual(broker.runtime.state.isStarted, true);
    });
  });

  describe("Multiple service stop failures", () => {
    it("should handle multiple service stop failures gracefully", async () => {
      broker = createNode({
        nodeId: "multi-stop-test",
        logger: { enabled: false },
      });

      broker.createService({
        name: "service1",
        mixins: [serviceHookMixin("stopped")],
      });

      broker.createService({
        name: "service2",
        mixins: [serviceHookMixin("stopped")],
      });

      broker.createService({
        name: "service3",
        stopped() {
          return Promise.resolve();
        },
      });

      await broker.start();

      // Stop should complete despite failures (graceful shutdown)
      await broker.stop();
      assert.strictEqual(broker.runtime.state.isStarted, false);
    });

    it("should preserve original error for single service stop failure", async () => {
      broker = createNode({
        nodeId: "single-stop-test",
        logger: { enabled: false },
      });

      broker.createService({
        name: "failingStopService",
        mixins: [serviceHookMixin("stopped")],
      });

      await broker.start();
      await assert.rejects(broker.stop(), /Rejected hook from stopped/);
    });
  });

  describe("Mixed success and failure scenarios", () => {
    it("should handle mixed critical and non-critical failures", async () => {
      broker = createNode({
        nodeId: "mixed-test",
        logger: { enabled: false },
      });

      broker.createService({
        name: "criticalFailure",
        critical: true,
        mixins: [serviceHookMixin("started")],
      });

      broker.createService({
        name: "nonCriticalFailure",
        critical: false,
        mixins: [serviceHookMixin("started")],
      });

      broker.createService({
        name: "successService",
        started() {
          return Promise.resolve();
        },
      });

      await assert.rejects(broker.start(), /Critical services failed: criticalFailure/);
    });

    it("should start successfully when all critical services succeed", async () => {
      broker = createNode({
        nodeId: "critical-success-test",
        logger: { enabled: false },
      });

      broker.createService({
        name: "criticalService1",
        critical: true,
        started() {
          return Promise.resolve();
        },
      });

      broker.createService({
        name: "criticalService2",
        critical: true,
        started() {
          return Promise.resolve();
        },
      });

      broker.createService({
        name: "nonCriticalFailure",
        critical: false,
        mixins: [serviceHookMixin("started")],
      });

      const startResult = await broker.start();
      assert.strictEqual(startResult, undefined);
      assert.strictEqual(broker.runtime.state.isStarted, true);
    });
  });

  describe("Edge cases", () => {
    it("should handle services with undefined critical property", async () => {
      broker = createNode({
        nodeId: "undefined-critical-test",
        logger: { enabled: false },
      });

      broker.createService({
        name: "undefinedCriticalService",
        // critical property is undefined, should default to critical: true
        mixins: [serviceHookMixin("started")],
      });

      await assert.rejects(broker.start(), /Rejected hook from started/);
    });

    it("should handle services with no lifecycle hooks", async () => {
      broker = createNode({
        nodeId: "no-hooks-test",
        logger: { enabled: false },
      });

      broker.createService({
        name: "simpleService",
        actions: {
          test() {
            return "ok";
          },
        },
      });

      const startResultNoHooks = await broker.start();
      assert.strictEqual(startResultNoHooks, undefined);
      assert.strictEqual(broker.runtime.state.isStarted, true);
    });
  });
});
