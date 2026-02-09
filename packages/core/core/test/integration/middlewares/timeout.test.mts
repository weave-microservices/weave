import { createNode } from "../../helper/index.mts";
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import type { Broker } from "../../../types/index.js";

describe("Timeout middleware", () => {
  let broker: Broker;

  beforeEach(() => {
    broker = createNode({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
      registry: {
        requestTimeout: 1000,
      },
    });

    broker.createService({
      name: "test-service",
      actions: {
        testAction() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve("hello");
            }, 2000);
          });
        },
        act1(context) {
          return context.call("test-service.act2");
        },
        act2(context) {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(context.call("test-service.act3"));
            }, 500);
          });
        },
        act3() {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve("hello");
            }, 400);
          });
        },
      },
    });

    return broker.start();
  });

  afterEach(() => broker.stop());

  it("should throw an timeout after for distributed action calls", (_t, done) => {
    broker
      .call("test-service.act1")
      .then(() => {
        done();
      })
      .catch((error) => {
        assert.strictEqual(error.message, "Action test-service.testAction timed out node node1.");
        done();
      });
  });
});
