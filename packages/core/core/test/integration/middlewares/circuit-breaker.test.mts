import { TransportAdapters } from "../../../lib/index.mts";
import { WeaveError } from "../../../lib/errors.mts";
import { createNode } from "../../helper/index.mts";
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

describe("Test circuit breaker", () => {
  const node1 = createNode({
    nodeId: "node1",
    logger: {
      enabled: false,
      level: "fatal",
    },
    transport: {
      adapter: TransportAdapters.Dummy(),
    },
    circuitBreaker: {
      enabled: true,
      failureOnError: true,
      failureOnTimeout: true,
      maxFailures: 3,
    },
  });

  const node2 = createNode({
    nodeId: "node2",
    logger: {
      enabled: false,
    },
    transport: {
      adapter: TransportAdapters.Dummy(),
    },
  });

  node2.createService({
    name: "test",
    actions: {
      good() {
        return "Everthing is fine.";
      },
      bad(context) {
        if (context.data.error !== true) {
          return Promise.reject(new WeaveError("No Permission"));
        } else {
          return "ok";
        }
      },
      ugly() {
        return new Promise((resolve) => {
          setTimeout(() => {
            return resolve("OK");
          }, 2000);
        });
      },
    },
  });

  before(async () => {
    await node1.start();
    await node2.start();
  });

  after(async () => {
    await node1.stop();
    await node2.stop();
  });

  it("Should call test.good 5 times without problems", () => {
    return node1
      .call("test.good")
      .then(() => node1.call("test.good"))
      .then(() => node1.call("test.good"))
      .then(() => node1.call("test.good"))
      .then(() => node1.call("test.good"))
      .then(() => node1.call("test.good"))
      .then((res) => assert.strictEqual(res, "Everthing is fine."));
  });

  it("Should throw error", () => {
    return node1
      .call("test.bad")
      .catch((error) => {
        assert.strictEqual(error.name, "WeaveError");
        return node1.call("test.bad");
      })
      .catch((error) => {
        assert.strictEqual(error.name, "WeaveError");
        return node1.call("test.bad");
      })
      .catch((error) => {
        assert.strictEqual(error.name, "WeaveError");
        return node1.call("test.bad");
      })
      .catch((error) => {
        assert.strictEqual(error.name, "WeaveServiceNotAvailableError");
        return "ok";
      })
      .then((result) => assert.strictEqual(result, "ok"));
  });

  it("Should switch from half open to open", async () => {
    await new Promise((resolve) => setTimeout(resolve, 11000));
    return node1
      .call("test.bad")
      .catch((error) => {
        assert.strictEqual(error.name, "WeaveError");
        return node1.call("test.bad");
      })
      .catch((error) => {
        assert.strictEqual(error.name, "WeaveServiceNotAvailableError");
        return "ok";
      })
      .then((result) => assert.strictEqual(result, "ok"));
  });

  it("Should switch from half-open to close", async () => {
    await new Promise((resolve) => setTimeout(resolve, 11000));
    return node1
      .call("test.bad", { error: true })
      .then((result) => assert.strictEqual(result, "ok"));
  });
});
