import utils from "@weave-js/utils";
import Middleware from "../../../lib/middlewares/bulkhead.mts";
import { createNode } from "../../helper/index.mts";

const config = {
  logger: {
    enabled: false,
    level: "fatal",
  },
};

// import SlowService from '../../services/slow.service.mts';
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("Test bulkhead middleware", () => {
  const broker = createNode(config);
  const contentFactory = broker.runtime.contextFactory;
  const handler = jest.fn(() => Promise.resolve("hooray!!!"));
  const middleware = Middleware(broker.runtime);
  const service = {};
  const action = {
    name: "math.add",
    bulkhead: {
      enabled: false,
    },
    handler,
    service,
  };

  const endpoint = {
    action,
    node: {
      id: broker.nodeId,
    },
  };

  it("should register hooks", () => {
    assert.notStrictEqual(middleware.localAction, undefined);
  });

  it("should not wrap handler if bulkhead is disabled", () => {
    broker.options.bulkhead!.enabled = false;

    const newHandler = middleware.localAction.call(broker, handler, action);
    assert.strictEqual(newHandler, handler);
  });

  it("should not wrap handler if bulkhead is disabled", () => {
    broker.options.bulkhead.enabled = true;

    const newHandler = middleware.localAction.call(broker, handler, action);
    expect(newHandler).not.toBe(handler);
  });

  it("should call the action 2 times bevore the requests get queued", (done) => {
    broker.options.bulkhead.enabled = true;
    broker.options.bulkhead.concurrentCalls = 2;
    broker.options.bulkhead.maxQueueSize = 10;

    let flow = [];

    const handler = jest.fn((context) => {
      flow.push("handler-" + context.data.p);
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 10);
      });
    });

    const contexts = [...Array(10)].map((_, i) => contentFactory.create(endpoint, { p: i }));
    const wrappedHandler = middleware.localAction.call(broker, handler, action);

    Promise.all(contexts.map((context) => wrappedHandler(context)));
    expect(handler).toBeCalledTimes(2);
    assert.deepStrictEqual(flow, ["handler-0", "handler-1"]);

    flow = [];
    utils.promiseDelay(Promise.resolve(), 1000).then(() => {
      expect(handler).toBeCalledTimes(10);
      assert.deepStrictEqual(
        flow,
        expect.arrayContaining([
          "handler-2",
          "handler-3",
          "handler-4",
          "handler-5",
          "handler-6",
          "handler-7",
          "handler-8",
          "handler-9",
        ]),
      );
      done();
    });

    // assert.strictEqual(flow, handler)
  });

  it("should call the action 2 times immediately bevore the last requests get queued", (done) => {
    broker.options.bulkhead.enabled = true;
    broker.options.bulkhead.concurrentCalls = 2;
    broker.options.bulkhead.maxQueueSize = 10;

    let flow = [];

    const handler = jest.fn((context) => {
      flow.push("handler-" + context.data.p);
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 10);
      });
    });
    const contexts = [...Array(20)].map((_, i) => contentFactory.create(endpoint, { p: i }));
    const wrappedHandler = middleware.localAction.call(broker, handler, action);

    Promise.all(
      contexts.map((context) =>
        wrappedHandler(context).catch((error) => flow.push(error.name + "-" + context.data.p)),
      ),
    );
    expect(handler).toBeCalledTimes(2);
    // assert.deepStrictEqual(flow, [
    //     'handler-0',
    //     'handler-1'
    // ])

    flow = [];
    utils.promiseDelay(Promise.resolve(), 1000).then(() => {
      expect(handler).toBeCalledTimes(13);
      assert.deepStrictEqual(
        flow,
        expect.arrayContaining([
          "handler-2",
          "handler-3",
          "handler-4",
          "handler-5",
          "handler-6",
          "handler-7",
          "handler-8",
          "handler-9",
        ]),
      );
      done();
    });
  });
});
