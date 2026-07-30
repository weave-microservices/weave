import Middleware from "../../../lib/middlewares/retry/index.mts";
import { WeaveRetryableError } from "../../../lib/errors.mts";
import { createNode } from "../../helper/index.mts";
import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import type { Endpoint, ServiceInjection } from "../../../types/index.js";

const config = {
  logger: {
    enabled: false,
  },
};

describe("Test retry middleware", () => {
  const broker = createNode(config);
  const contextFactory = broker.runtime.contextFactory;
  const handlerFn = mock.fn(() => Promise.resolve("hooray!!!"));
  const middleware = Middleware();
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

  it("should register middleware hooks", () => {
    assert.notStrictEqual(middleware.localAction, undefined);
    assert.notStrictEqual(middleware.remoteAction, undefined);
  });

  it("should not wrap handler if retry middleware is disabled", () => {
    broker.options.bulkhead!.enabled = false;

    const newHandler = middleware.localAction!.call(broker, handlerFn, action);
    assert.strictEqual(newHandler, handlerFn);
  });

  it("should not wrap handler if bulkhead is disabled", () => {
    broker.options.retryPolicy!.enabled = true;

    const newHandler = middleware.localAction!.call(broker, handlerFn, action);
    assert.notStrictEqual(newHandler, handlerFn);
  });

  it("should call the action 2 times bevore the requests get queued", async () => {
    broker.options.retryPolicy!.enabled = true;
    broker.options.retryPolicy!.delay = 200;
    broker.options.retryPolicy!.retries = 3;

    const error = new WeaveRetryableError("not this time");
    const handler = mock.fn(() => Promise.reject(error));
    const newHandler = middleware.localAction!.call(broker, handler, action);

    const context = contextFactory.create(endpoint, { name: "Kevin" });

    const callMock = mock.fn(() => Promise.resolve("next call"));
    (broker as unknown as { call: typeof callMock }).call = callMock;

    const serviceInjections = {} as ServiceInjection;
    await newHandler(context, serviceInjections);
    assert.strictEqual(context.retryCount, 1);
    assert.strictEqual(handler.mock.callCount(), 1);
    assert.strictEqual(callMock.mock.callCount(), 1);
  });

  it("should get rejected if all attempts fail", async () => {
    broker.options.retryPolicy!.enabled = true;
    broker.options.retryPolicy!.delay = 200;
    broker.options.retryPolicy!.retries = 0;

    const error = new WeaveRetryableError("not this time");
    const handler = mock.fn(() => Promise.reject(error));
    const newHandler = middleware.localAction!.call(broker, handler, action);

    const context = contextFactory.create(endpoint, { name: "Kevin" });

    const callMock = mock.fn(() => Promise.resolve("next call"));
    (broker as unknown as { call: typeof callMock }).call = callMock;

    const serviceInjections = {} as ServiceInjection;
    await assert.rejects(
      async () => newHandler(context, serviceInjections),
      (err: Error) => {
        assert.strictEqual(context.retryCount, 1);
        assert.strictEqual(err.message, "not this time");
        return true;
      },
    );
  });

  it("should get rejected on remote actions", () => {});
});
