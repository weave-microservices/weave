import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createBroker } from "@weave-js/core";
import nodeService from "../lib/node-service.mts";

describe("Test internal service $node", () => {
  let broker: ReturnType<typeof createBroker>;

  beforeEach(async () => {
    broker = createBroker({
      nodeId: "node1",
      logger: {
        enabled: false,
      },
    });

    broker.createService(nodeService);

    await broker.start();
  });

  afterEach(async () => {
    await broker.stop();
  });

  it('should provide four actions from "$node"', async () => {
    const result = await broker.call("$node.actions", { withActions: true });

    assert.equal(result.length, 4);
  });

  it("should get one service from the node service", async () => {
    const result = await broker.call("$node.services", { withNodeService: true });

    assert.equal(result.length, 1);
    assert.equal(result[0].name, "$node");
  });

  it("should get no event from the node service", async () => {
    const result = await broker.call("$node.events", { withNodeService: true });

    assert.equal(result.length, 0);
  });

  it("should get a list of all connected nodes", async () => {
    const result = await broker.call("$node.list");

    assert.equal(result.length, 1);
  });

  it("should list the actions of the node service", async () => {
    const [service] = await broker.call("$node.services", {
      withNodeService: true,
      withActions: true,
    });

    assert.deepEqual(Object.keys(service.actions).sort(), [
      "$node.actions",
      "$node.events",
      "$node.list",
      "$node.services",
    ]);
    assert.equal("handler" in service.actions["$node.list"], false);
    assert.equal("service" in service.actions["$node.list"], false);
  });
});
