import type { Context } from "../../types/index.js";
import hasServiceScope from "./scope-checks/service.scope.mts";
import malformedActionService from "../services/malformed-action.service.mts";
import MathV2 from "../services/v2.math.service.mts";
import { createNode } from "../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Test broker call service", () => {
  it("should call a service.", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    let testCalled = false;
    void node1.createService({
      name: "testService",
      actions: {
        test: () => {
          testCalled = true;
        },
        test2: () => {},
      },
    });

    await node1.start();
    await node1.call("testService.test");
    assert.strictEqual(testCalled, true);
    await node1.stop();
  });

  it("should call a service action and return a value.", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        sayHello(context: Context) {
          return `Hello ${(context.data as Record<string, string>).name}!`;
        },
      },
    });

    await node1.start();
    const result = await node1.call("testService.sayHello", { name: "Hans" });
    assert.strictEqual(result, "Hello Hans!");
    await node1.stop();
  });

  it("should call a service action and return an error.", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        sayHello(_context) {
          return Promise.reject(new Error("Error from testService"));
        },
      },
    });

    await node1.start();
    await assert.rejects(
      () => node1.call("testService.sayHello", { name: "Hans" }),
      /Error from testService/,
    );
    await node1.stop();
  });

  it("should call a service action and pass a meta value to a chained action.", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      actions: {
        sayHello(context) {
          context.meta.userId = 1;
          return context.call("testService2.sayHello");
        },
      },
    });

    node1.createService({
      name: "testService2",
      actions: {
        sayHello(context) {
          assert.strictEqual(context.meta.userId, 1);
        },
      },
    });

    await node1.start();
    await node1.call("testService.sayHello", { name: "Hans" }, { meta: { userId: 1 } });
    await node1.stop();
  });
});

describe("Service lifetime hooks", () => {
  it("should call lifecycle hooks.", async () => {
    const order: string[] = [];

    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "testService",
      created() {
        order.push("created");
      },
      started() {
        order.push("started");
      },
      stopped() {
        order.push("stopped");
      },
    });

    await node1.start();
    await node1.stop();
    assert.strictEqual(order.join("-"), "created-started-stopped");
  });

  it("should call lifecycle hooks with correct scope. [creaded]", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    let scopeChecked = false;
    node1.createService({
      name: "testService",
      created() {
        hasServiceScope(this);
        scopeChecked = true;
      },
    });

    await node1.start();
    await node1.stop();
    assert.strictEqual(scopeChecked, true);
  });

  it("should call lifecycle hooks with correct scope. [started]", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    let scopeChecked = false;
    node1.createService({
      name: "testService",
      started() {
        hasServiceScope(this);
        scopeChecked = true;
      },
    });

    await node1.start();
    await node1.stop();
    assert.strictEqual(scopeChecked, true);
  });

  it("should call lifecycle hook with correct scope. [stopped]", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });
    let scopeChecked = false;
    node1.createService({
      name: "testService",
      stopped() {
        hasServiceScope(this);
        scopeChecked = true;
      },
    });

    await node1.start();
    await node1.stop();
    assert.strictEqual(scopeChecked, true);
  });
});

describe("Service actions", () => {
  it("should fail with an malformed action description", () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    assert.throws(
      // @ts-expect-error - intentionally passing malformed service schema for testing
      () => node1.createService(malformedActionService),
      /Missing action handler in "timeout" on service "malformed-action"/,
    );
  });
});

describe("Protected service actions", () => {
  it("should fail with an malformed action description", () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    assert.throws(
      // @ts-expect-error - intentionally passing malformed service schema for testing
      () => node1.createService(malformedActionService),
      /Missing action handler in "timeout" on service "malformed-action"/,
    );
  });
});

describe("Versioned Services", () => {
  it("should create an versioned service", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService(MathV2);

    await node1.start();
    const services = [...node1.registry.serviceCollection.services];
    const mathService = services.find((service) => service.name === "math");
    assert.strictEqual(mathService?.version, 2);
    await node1.stop();
  });
});

describe("Errors on service creation", () => {
  it("should fail, if there is no name", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    const createService = () =>
      // @ts-expect-error - intentionally passing schema without name for testing
      node1.createService({
        actions: {
          a1() {},
          a2() {},
          a3() {},
        },
      });

    assert.throws(createService, /Service name is missing!/);
  });

  it("should fail, if there is no name", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    const createService = () =>
      // @ts-expect-error - intentionally passing schema without name for testing
      node1.createService({
        actions: {
          a1() {},
          a2() {},
          a3() {},
        },
      });

    assert.throws(createService, /Service name is missing!/);
  });
});

describe("Service action handler signature", () => {
  it("interface should equal", async () => {
    const node1 = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    node1.createService({
      name: "service1",
      actions: {
        action1: {
          handler(context, service) {
            assert.notStrictEqual(service.errors, undefined);
            assert.notStrictEqual(service.runtime, undefined);
            assert.notStrictEqual(service.service, undefined);
          },
        },
      },
    });

    await node1.start();
    await node1.call("service1.action1");
    await node1.stop();
  });
});
