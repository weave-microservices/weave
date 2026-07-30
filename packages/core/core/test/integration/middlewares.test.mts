import { TransportAdapters } from "../../lib/index.mts";
import { createNode } from "../helper/index.mts";
import { describe, it } from "node:test";
import * as assert from "node:assert/strict";
import type {
  ActionHandler,
  Context,
  Middleware,
  Runtime,
  ServiceSchema,
  ParsedAction,
} from "../../types/index.js";

describe("Middleware hooks", () => {
  it("should call hooks in the right order", async () => {
    const order: string[] = [];

    const middleware = {
      starting: () => {
        order.push("starting");
      },
      started: () => {
        order.push("started");
      },
      stopping: () => {
        order.push("stopping");
      },
      stopped: () => {
        order.push("stopped");
      },
    };

    const broker = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      middlewares: [middleware],
    });

    await broker.start();
    await broker.stop();
    assert.strictEqual(order.join("-"), "starting-started-stopping-stopped");
  });

  it("should call hooks in the right order (with service hooks)", async () => {
    const order: string[] = [];

    const middleware = {
      starting: () => {
        order.push("starting");
      },
      started: () => {
        order.push("started");
      },
      serviceCreating: function () {
        order.push("serviceCreating");
      },
      serviceCreated: function () {
        order.push("serviceCreated");
      },
      serviceStarting: () => {
        order.push("serviceStarting");
      },
      serviceStarted: () => {
        order.push("serviceStarted");
      },
      serviceStopping: () => {
        order.push("serviceStopping");
      },
      serviceStopped: () => {
        order.push("serviceStopped");
      },
      stopping: () => {
        order.push("stopping");
      },
      stopped: () => {
        order.push("stopped");
      },
      localAction: (handler: ActionHandler, _action: ParsedAction) => {
        return function (context: Context) {
          order.push("localAction1");
          return handler(context, {} as any).then((res: any) => {
            order.push("localAction2");
            return res;
          });
        };
      },
      emit(next: (event: string, payload?: unknown) => Promise<void>) {
        return (event: string, payload?: unknown) => {
          order.push("emit");
          return next(event, payload);
        };
      },
      broadcast(next: (event: string, payload?: unknown) => Promise<void>) {
        return (event: string, payload?: unknown) => {
          order.push("broadcast");
          return next(event, payload);
        };
      },
    } satisfies Middleware;

    const broker = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      middlewares: [middleware],
    });

    broker.createService({
      name: "testService",
      actions: {
        test(context) {
          context.emit("hihi");
          context.broadcast("hoho");
          return true;
        },
      },
    });

    await broker.start();
    await broker.call("testService.test");
    await broker.stop();
    assert.strictEqual(
      order.join("-"),
      "serviceCreating-serviceCreated-starting-serviceStarting-serviceStarted-started-localAction1-emit-broadcast-localAction2-stopping-serviceStopping-serviceStopped-stopped",
    );
  });

  it("should call local action hook", async () => {
    const middleware: Middleware = {
      localAction: function (handler: ActionHandler) {
        return (context: Context) => {
          (context.data as { paramFromMiddleware?: string }).paramFromMiddleware = "hello world";
          return handler(context, {} as any);
        };
      },
    };

    const broker = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
        level: "fatal",
      },
      middlewares: [middleware],
    });

    broker.createService({
      name: "testService",
      actions: {
        helloWorld(context) {
          return context.data;
        },
      },
    });

    await broker.start();
    const res = await broker.call("testService.helloWorld");
    assert.strictEqual((res as { paramFromMiddleware: string }).paramFromMiddleware, "hello world");
  });

  it("should call remote action hook", async () => {
    const middleware: Middleware = {
      remoteAction: function (handler: ActionHandler) {
        return (context: Context) => {
          (context.data as { paramFromMiddleware?: string }).paramFromMiddleware = "hello world";
          return handler(context, {} as any);
        };
      },
    };

    const broker1 = createNode({
      nodeId: "node1",
      transport: {
        adapter: TransportAdapters.Dummy(),
      },
      logger: {
        enabled: false,
      },
      middlewares: [middleware],
    });

    const broker2 = createNode({
      nodeId: "node2",
      transport: {
        adapter: TransportAdapters.Dummy(),
      },
      logger: {
        enabled: false,
      },
    });

    broker2.createService({
      name: "math",
      actions: {
        add(context) {
          return { params: context.data, result: Number(context.data.a) + Number(context.data.b) };
        },
      },
    });

    await Promise.all([broker1.start(), broker2.start()]);
    await broker1.waitForServices(["math"]);
    const res = (await broker1.call("math.add", { a: 1, b: 2 })) as {
      result: number;
      params: { paramFromMiddleware: string };
    };
    assert.strictEqual(res.result, 3);
    assert.strictEqual(res.params.paramFromMiddleware, "hello world");
  });

  it("should decorate core module", async () => {
    const middleware: Middleware = {
      created(runtime?: Runtime) {
        if (runtime) {
          (runtime.broker as any).fancyTestmethod = () => {};
        }
      },
    };

    const broker1 = createNode({
      nodeId: "node1",

      logger: {
        enabled: false,
      },
      middlewares: [middleware],
    });

    await broker1.start();
    assert.notStrictEqual((broker1 as any).fancyTestmethod, undefined);
  });
});

describe("Service creating hook", () => {
  it("should modify the given service schema", async () => {
    const middleware: Middleware = {
      serviceCreating: (_: any, schema: ServiceSchema) => {
        if (!schema.methods) {
          schema.methods = {};
        }
        schema.methods.pull = () => {
          return "return pull";
        };
      },
    };

    const broker = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      middlewares: [middleware],
    });

    broker.createService({
      name: "testService",
      actions: {
        callPull() {
          // call hook injected method.
          return this.pull();
        },
      },
    });

    await broker.start();
    const res = await broker.call("testService.callPull");
    assert.strictEqual(res, "return pull");
  });
});
