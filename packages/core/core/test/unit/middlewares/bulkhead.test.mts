import * as utils from "@weave-js/utils";
import Middleware from "../../../lib/middlewares/bulkhead/index.mts";
import { createNode } from "../../helper/index.mts";
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { Context, LogLevel, Endpoint, ServiceInjection } from "../../../types/index.js";

const config = {
  logger: {
    enabled: false,
    level: "fatal" as LogLevel,
  },
};

describe("Test bulkhead middleware", () => {
  const broker = createNode(config);
  const contentFactory = broker.runtime.contextFactory;
  const handlerFn = mock.fn(() => Promise.resolve("hooray!!!"));
  const middleware = Middleware(broker.runtime);
  const service = {};
  const action = {
    name: "math.add",
    bulkhead: {
      enabled: false,
    },
    handler: handlerFn,
    service,
  };

  const endpoint = {
    action,
    node: {
      id: broker.nodeId,
    },
    service: { name: "math" },
    isLocal: true,
    state: true,
    name: "math.add",
    updateAction: () => {},
    isAvailable: () => true,
  } as unknown as Endpoint;

  it("should register hooks", () => {
    assert.notStrictEqual(middleware.localAction, undefined);
  });

  it("should not wrap handler if bulkhead is disabled", () => {
    broker.options.bulkhead!.enabled = false;

    const newHandler = middleware.localAction!.call(broker, handlerFn, action);
    assert.strictEqual(newHandler, handlerFn);
  });

  it("should not wrap handler if bulkhead is disabled", () => {
    broker.options.bulkhead!.enabled = true;

    const newHandler = middleware.localAction!.call(broker, handlerFn, action);
    assert.notStrictEqual(newHandler, handlerFn);
  });

  it("should call the action 2 times bevore the requests get queued", async () => {
    broker.options.bulkhead!.enabled = true;
    broker.options.bulkhead!.concurrentCalls = 2;
    broker.options.bulkhead!.maxQueueSize = 10;

    let flow: string[] = [];

    const handler = mock.fn((context: Context, _serviceInjections: ServiceInjection) => {
      flow.push("handler-" + (context.data as { p: number }).p);
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 10);
      });
    });

    const contexts = [...Array(10)].map((_, i) => contentFactory.create(endpoint, { p: i }));
    const wrappedHandler = middleware.localAction!.call(broker, handler, action);
    const serviceInjections = {} as ServiceInjection;

    Promise.all(contexts.map((context) => wrappedHandler(context, serviceInjections)));
    assert.strictEqual(handler.mock.callCount(), 2);
    assert.deepStrictEqual(flow, ["handler-0", "handler-1"]);

    flow = [];
    await utils.promiseDelay(Promise.resolve(), 1000);
    assert.strictEqual(handler.mock.callCount(), 10);
    // Check that all expected handlers were called
    const expectedHandlers = ["handler-2", "handler-3", "handler-4", "handler-5", "handler-6", "handler-7", "handler-8", "handler-9"];
    for (const expected of expectedHandlers) {
      assert.ok(flow.includes(expected), `Expected ${expected} to be in flow`);
    }
  });

  it("should call the action 2 times immediately bevore the last requests get queued", async () => {
    broker.options.bulkhead!.enabled = true;
    broker.options.bulkhead!.concurrentCalls = 2;
    broker.options.bulkhead!.maxQueueSize = 10;

    let flow: string[] = [];

    const handler = mock.fn((context: Context, _serviceInjections: ServiceInjection) => {
      flow.push("handler-" + (context.data as { p: number }).p);
      return new Promise<void>((resolve) => {
        setTimeout(() => resolve(), 10);
      });
    });
    const contexts = [...Array(20)].map((_, i) => contentFactory.create(endpoint, { p: i }));
    const wrappedHandler = middleware.localAction!.call(broker, handler, action);
    const serviceInjections = {} as ServiceInjection;

    Promise.all(
      contexts.map((context) =>
        wrappedHandler(context, serviceInjections).catch((error: Error) => flow.push(error.name + "-" + (context.data as { p: number }).p)),
      ),
    );
    assert.strictEqual(handler.mock.callCount(), 2);

    flow = [];
    await utils.promiseDelay(Promise.resolve(), 1000);
    assert.strictEqual(handler.mock.callCount(), 13);
    // Check that expected handlers were called
    const expectedHandlers = ["handler-2", "handler-3", "handler-4", "handler-5", "handler-6", "handler-7", "handler-8", "handler-9"];
    for (const expected of expectedHandlers) {
      assert.ok(flow.includes(expected), `Expected ${expected} to be in flow`);
    }
  });
});
