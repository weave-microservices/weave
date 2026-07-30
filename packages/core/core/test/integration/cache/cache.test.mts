import FakeTimers from "@sinonjs/fake-timers";
import { createNode } from "../../helper/index.mts";
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { Broker } from "../../../types/index.js";

describe("Cache system", () => {
  let clock: FakeTimers.InstalledClock;
  let node1: Broker;

  beforeEach(() => {
    clock = FakeTimers.install();

    node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      cache: {
        enabled: true,
      },
      metrics: {
        enabled: true,
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        cachedAction: {
          cache: {
            keys: ["text"],
          },
          handler(context) {
            this.counter = this.counter + 1;
            return (
              (context.data as { text: string }).text.split("").reverse().join("") + this.counter
            );
          },
        },
        notCachedAction: {
          handler(context) {
            this.counter = this.counter + 1;
            return (
              (context.data as { text: string }).text.split("").reverse().join("") + this.counter
            );
          },
        },
        cachedMultiParam: {
          params: {
            firstname: "string",
            lastname: { type: "string", optional: true },
          },
          cache: {
            keys: ["firstname", "lastname"],
          },
          handler(context) {
            this.counter = this.counter + 1;
            const data = context.data as { firstname: string; lastname?: string };
            return `Hello ${data.firstname} ${data.lastname}! ${this.counter}`;
          },
        },
      },
      created() {
        this.counter = 0;
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
    clock.uninstall();
  });

  it("should return a cached result", async () => {
    await node1.waitForServices(["testService"]);
    const result = await node1.call("testService.cachedAction", { text: "hello user" });
    // reverse text + internal counter number
    assert.strictEqual(result, "resu olleh1");
    const result2 = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result2, "resu olleh1");
  });

  it("should return a new result because the cached value is expired. (check in get function)", async () => {
    await node1.waitForServices(["testService"]);
    const result = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result, "resu olleh1");
    clock.tick(5000);
    const result2 = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result2, "resu olleh2");
  });

  it("should return a new result because the cached value is expired. (check in expiration timer)", async () => {
    await node1.waitForServices(["testService"]);
    const result = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result, "resu olleh1");
    clock.tick(6000);
    const result2 = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result2, "resu olleh2");
  });

  it("should work with uncached actions", async () => {
    await node1.waitForServices(["testService"]);
    const promise = node1.call("testService.notCachedAction", { text: "hello user" });
    const result = await promise;
    assert.strictEqual(result, "resu olleh1");
    assert.strictEqual(
      (promise as { context?: { isCachedResult?: boolean } }).context?.isCachedResult,
      false,
    );
  });

  it("should work with multiple keys", async () => {
    await node1.waitForServices(["testService"]);
    const promise = node1.call("testService.cachedMultiParam", {
      firstname: "Donald",
      lastname: "Duck",
    });
    const result = await promise;
    assert.strictEqual(result, "Hello Donald Duck! 1");
    // cache is disabled, so "isCachedResult" is undefined.
    assert.ok(!(promise as { context?: { isCachedResult?: boolean } }).context?.isCachedResult);

    const promise2 = node1.call("testService.cachedMultiParam", {
      firstname: "Donald",
      lastname: "Duck",
    });
    const result2 = await promise;
    assert.strictEqual(result2, "Hello Donald Duck! 1");

    // Result is cached, so "isCachedResult" is true.
    assert.ok((promise2 as { context?: { isCachedResult?: boolean } }).context?.isCachedResult);

    // try to change the order
    const promise3 = node1.call("testService.cachedMultiParam", {
      lastname: "Duck",
      firstname: "Donald",
    });
    const result3 = await promise;
    assert.strictEqual(result3, "Hello Donald Duck! 1");
    // Result is cached, so "isCachedResult" is true.
    assert.ok((promise3 as { context?: { isCachedResult?: boolean } }).context?.isCachedResult);
  });

  it("should work with optional keys", async () => {
    await node1.waitForServices(["testService"]);
    const promise = node1.call("testService.cachedMultiParam", { firstname: "Donald" });
    const result = await promise;
    assert.strictEqual(result, "Hello Donald undefined! 1");
    // cache is disabled, so "isCachedResult" is undefined.
    assert.ok(!(promise as { context?: { isCachedResult?: boolean } }).context?.isCachedResult);
  });
});

describe("Cache system with cache lock", () => {
  let clock: FakeTimers.InstalledClock;
  let node1: Broker;

  beforeEach(() => {
    clock = FakeTimers.install();

    node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      cache: {
        enabled: true,
        lock: {
          enabled: true,
        },
      },
      metrics: {
        enabled: true,
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        cachedAction: {
          cache: {
            keys: ["text"],
          },
          handler(context) {
            this.counter = this.counter + 1;
            return (
              (context.data as { text: string }).text.split("").reverse().join("") + this.counter
            );
          },
        },
      },
      created() {
        this.counter = 0;
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
    clock.uninstall();
  });

  it("should return a cached result", async () => {
    await node1.waitForServices(["testService"]);
    const result = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result, "resu olleh1");
    const result2 = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result2, "resu olleh1");
  });

  it("should return a new result because the cached value is expired. (check in get function)", async () => {
    await node1.waitForServices(["testService"]);
    const result = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result, "resu olleh1");
    clock.tick(5000);
    const result2 = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result2, "resu olleh2");
  });

  it("should return a new result because the cached value is expired. (check in expiration timer)", async () => {
    await node1.waitForServices(["testService"]);
    const result = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result, "resu olleh1");
    clock.tick(6000);
    const result2 = await node1.call("testService.cachedAction", { text: "hello user" });
    assert.strictEqual(result2, "resu olleh2");
  });
});

describe("Cache system manual", () => {
  let clock: FakeTimers.InstalledClock;
  let node1: Broker;

  beforeEach(() => {
    clock = FakeTimers.install();

    node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      cache: {
        enabled: true,
      },
      metrics: {
        enabled: true,
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        cachedAction: {
          cache: {
            keys: ["text"],
          },
          handler(context) {
            this.counter = this.counter + 1;
            return (
              (context.data as { text: string }).text.split("").reverse().join("") + this.counter
            );
          },
        },
        notCachedAction: {
          handler(context) {
            this.counter = this.counter + 1;
            return (
              (context.data as { text: string }).text.split("").reverse().join("") + this.counter
            );
          },
        },
        cachedMultiParam: {
          params: {
            firstname: "string",
            lastname: { type: "string", optional: true },
          },
          cache: {
            keys: ["firstname", "lastname"],
          },
          handler(context) {
            this.counter = this.counter + 1;
            const data = context.data as { firstname: string; lastname?: string };
            return `Hello ${data.firstname} ${data.lastname}! ${this.counter}`;
          },
        },
      },
      created() {
        this.counter = 0;
      },
    });

    node1.start();
  });

  afterEach(() => {
    node1.stop();
    clock.uninstall();
  });

  it("should clean cache items manually", () => {});
});
