import { TransportAdapters } from "../../lib/index.mts";
import { createNode } from "../helper/index.mts";
import { describe, it, test } from "node:test";
import assert from "node:assert/strict";

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
      localAction: (handler, action) => {
        return function (context) {
          order.push("localAction1");
          return handler(context).then((res) => {
            order.push("localAction2");
            return res;
          });
        };
      },
      emit(next) {
        return (event, payload) => {
          order.push("emit");
          return next(event, payload);
        };
      },
      broadcast(next) {
        return (event, payload) => {
          order.push("broadcast");
          return next(event, payload);
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

  it("should call local action hook", (done) => {
    const middleware = {
      localAction: function (handler) {
        return (context) => {
          context.data.paramFromMiddleware = "hello world";
          return handler(context);
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

    broker.start().then(() => {
      return broker.call("testService.helloWorld").then((res) => {
        assert.strictEqual(res.paramFromMiddleware, "hello world");
        done();
      });
    });
  });

  it("should call remote action hook", (done) => {
    const middleware = {
      remoteAction: function (handler) {
        return (context) => {
          context.data.paramFromMiddleware = "hello world";
          return handler(context);
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

    Promise.all([broker1.start(), broker2.start()])
      .then(() => broker1.waitForServices(["math"]))
      .then(() => {
        return broker1.call("math.add", { a: 1, b: 2 }).then((res) => {
          assert.strictEqual(res.result, 3);
          assert.strictEqual(res.params.paramFromMiddleware, "hello world");
          done();
        });
      });
  });

  it("should decorate core module", () => {
    const middleware = {
      created(runtime) {
        runtime.broker.fancyTestmethod = () => {};
      },
    };

    const broker1 = createNode({
      nodeId: "node1",

      logger: {
        enabled: false,
      },
      middlewares: [middleware],
    });

    broker1.start();
    assert.notStrictEqual(broker1.fancyTestmethod, undefined);
  });
});

describe("Service creating hook", () => {
  it("should modify the given service schema", (done) => {
    const middleware = {
      serviceCreating: (_, schema) => {
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

    broker.start().then(() => {
      return broker.call("testService.callPull").then((res) => {
        assert.strictEqual(res, "return pull");
        done();
      });
    });
  });
});
