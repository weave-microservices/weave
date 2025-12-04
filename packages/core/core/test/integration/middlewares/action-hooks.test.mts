import { createNode } from "../../helper/index.mts";
import { describe, it, before, after, mock } from "node:test";
import assert from "node:assert/strict";

describe("Action hooks", () => {
  const fetchName = mock.fn();
  const method1 = mock.fn();
  const method2 = mock.fn();
  const arrayMethod = mock.fn();
  const log = mock.fn();
  const afterGreet = mock.fn();
  const errorHook = mock.fn((_, error) => Promise.reject(error));
  const wildcardErrorHook = mock.fn((_, error) => Promise.reject(error));

  const broker = createNode({
    nodeId: "test-node",
    logger: {
      enabled: false,
      level: "fatal",
    },
  });

  broker.createService({
    name: "greeter",
    hooks: {
      before: {
        "*": log,
        sayHello: fetchName,
      },
      after: {
        "*": log,
        sayHello: ["method1", "method2", arrayMethod],
        greet: "afterGreet",
      },
      error: {
        "*": "wildcardErrorHook",
        errorAction: "errorHook",
      },
    },
    actions: {
      sayHello: {
        params: {
          id: "number",
        },
        handler() {
          return "hello";
        },
      },
      greet() {
        return "hello";
      },
      errorAction() {
        return Promise.reject(new Error("Error"));
      },
    },
    methods: {
      fetchName,
      method1,
      method2,
      afterGreet,
      errorHook,
      wildcardErrorHook,
    },
  });

  before(() => broker.start());
  after(() => broker.stop());

  it("should call a before wildcard hock.", async () => {
    await broker.call("greeter.sayHello", { id: 1 });
    assert.strictEqual(log.mock.callCount(), 2);
  });

  it("should call a before hock by action name.", async () => {
    await broker.call("greeter.sayHello", { id: 1 });
    assert.strictEqual(fetchName.mock.callCount(), 2);
  });

  it("should call a  hock by action name.", async () => {
    await broker.call("greeter.sayHello", { id: 1 });
    assert.strictEqual(method1.mock.callCount(), 3);
    assert.strictEqual(method2.mock.callCount(), 3);
  });

  it("should call a hook by string.", async () => {
    await broker.call("greeter.greet", { id: 1 });
    assert.strictEqual(afterGreet.mock.callCount(), 1);
  });

  it("should call a hook error hook.", async () => {
    try {
      await broker.call("greeter.errorAction", { id: 1 });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.strictEqual(error.message, "Error");
      assert.strictEqual(errorHook.mock.callCount(), 1);
      assert.strictEqual(wildcardErrorHook.mock.callCount(), 1);
    }
  });
});

describe("Action hooks in action definition", () => {
  const fetchName = mock.fn();
  const method1 = mock.fn();
  const method2 = mock.fn();
  const arrayMethod = mock.fn();
  const afterGreet = mock.fn();
  const errorHook = mock.fn((_, error) => Promise.reject(error));

  const broker = createNode({
    nodeId: "action-hook-node",
    logger: {
      enabled: false,
      level: "fatal",
    },
  });

  broker.createService({
    name: "greeter",
    actions: {
      sayHello: {
        params: {
          id: "number",
        },
        hooks: {
          before: [fetchName],
          after: ["method1", "method2", arrayMethod, "afterGreet"],
        },
        handler() {
          return "hello";
        },
      },
      greet() {
        return "hello";
      },
      errorAction: {
        hooks: {
          error: ["errorHook"],
        },
        handler() {
          return Promise.reject(new Error("Error"));
        },
      },
    },
    methods: {
      fetchName,
      method1,
      method2,
      afterGreet,
      errorHook,
    },
  });

  before(() => broker.start());
  after(() => broker.stop());

  it("should call a before hock in action definition.", async () => {
    await broker.call("greeter.sayHello", { id: 1 });
    assert.strictEqual(fetchName.mock.callCount(), 1);
  });

  it("should call a before hock by action name in action definition.", async () => {
    await broker.call("greeter.sayHello", { id: 1 });
    assert.strictEqual(fetchName.mock.callCount(), 2);
  });

  it("should call a hock by action name in action definition.", async () => {
    await broker.call("greeter.sayHello", { id: 1 });
    assert.strictEqual(method1.mock.callCount(), 3);
    assert.strictEqual(method2.mock.callCount(), 3);
  });

  it("should call a after-hook by string in action definition.", async () => {
    await broker.call("greeter.greet", { id: 1 });
    assert.strictEqual(afterGreet.mock.callCount(), 3);
  });

  it("should call a hook error hook in action definition.", async () => {
    try {
      await broker.call("greeter.errorAction", { id: 1 });
      assert.fail("Should have thrown an error");
    } catch (error) {
      assert.strictEqual(error.message, "Error");
      assert.strictEqual(errorHook.mock.callCount(), 1);
    }
  });
});
