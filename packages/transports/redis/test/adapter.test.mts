import "./setup.mts";
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
// @ts-ignore - Weave is exported but types may not be fully resolved
import { Weave } from "@weave-js/core";
import REDISTransport from "../lib/index.mts";

describe("REDIS transport adapter", () => {
  let broker1: any;
  let broker2: any;
  let startedHook1Called = false;
  let startedHook2Called = false;

  const startedHook1 = () => {
    startedHook1Called = true;
  };

  const startedHook2 = () => {
    startedHook2Called = true;
  };

  beforeEach(async () => {
    startedHook1Called = false;
    startedHook2Called = false;

    broker1 = Weave({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      namespace: "redis-test",
      transport: {
        adapter: REDISTransport(),
      },
      started: startedHook1,
    });

    broker1.createService({
      name: "testService1",
      actions: {
        hello(context: any) {
          return "Hello from " + context.nodeId;
        },
      },
    });

    broker2 = Weave({
      nodeId: "node2",
      logger: {
        enabled: false,
      },
      namespace: "redis-test",
      transport: {
        adapter: REDISTransport(),
      },
      started: startedHook2,
    });

    broker2.createService({
      name: "testService2",
      actions: {
        hello(this: any) {
          return "Hello from " + this.broker.nodeId;
        },
      },
    });

    await Promise.all([broker1.start(), broker2.start()]);
  });

  afterEach(async () => {
    await Promise.all([broker1.stop(), broker2.stop()]);
    // Wait for async cleanup operations to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  it("should connect", () => {
    assert.strictEqual(startedHook1Called, true);
    assert.strictEqual(startedHook2Called, true);
  });

  it("should get node info", async () => {
    await broker1.waitForServices(["testService2"]);
    const result = await broker1.call("testService2.hello");
    assert.strictEqual(result, "Hello from node2");
  });
});
