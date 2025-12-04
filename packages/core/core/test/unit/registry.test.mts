import { Errors, TransportAdapters } from "../../lib/index.mts";
import { createNode } from "../../lib/registry/node.mts";
import { createRegistry } from "../../lib/registry/registry.mts";
import { createNode as createBroker } from "../helper/index.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const brokerSettings = {
  logger: {
    enabled: false,
  },
};

describe("Test Registry instance", () => {
  it("should create registry instance", () => {
    const broker = createBroker(brokerSettings);
    const registry = createRegistry(broker.runtime);

    assert.notStrictEqual(registry.init, undefined);
    assert.notStrictEqual(registry.nodeDisconnected, undefined);
    // assert.notStrictEqual(registry.onRegisterLocalAction, undefined);
    // assert.notStrictEqual(registry.onRegisterRemoteAction, undefined);
    assert.notStrictEqual(registry.processNodeInfo, undefined);
    assert.notStrictEqual(registry.registerActions, undefined);
    assert.notStrictEqual(registry.registerEvents, undefined);
    assert.notStrictEqual(registry.registerLocalService, undefined);
    assert.notStrictEqual(registry.registerRemoteServices, undefined);
    assert.notStrictEqual(registry.removeNode, undefined);
  });
});

describe('Test "registerLocalService"', () => {
  it("should register a local service", async () => {
    const broker = createBroker(brokerSettings);
    const registry = broker.registry;

    const service = {
      name: "test-service",
      version: 2,
      actions: {},
      events: {},
      methods: {},
    };

    registry.registerLocalService(service);

    assert.strictEqual(registry.nodeCollection.localNode.services.length, 1);
    await broker.stop();
  });
});

describe('Test "registerRemoteServices"', () => {
  it("should register remote services", async () => {
    const broker1 = createBroker({
      ...brokerSettings,
      transport: {
        adapter: TransportAdapters.Dummy(),
      },
    });
    const broker2 = createBroker({
      ...brokerSettings,
      nodeId: "node2",
      transport: {
        adapter: TransportAdapters.Dummy(),
      },
    });
    const registry = broker1.registry;
    const node = createNode("test-node");

    const service = {
      name: "test-service",
      version: 2,
      actions: {
        "users.find"() {},
      },
      events: {},
      methods: {},
    };

    await Promise.all([broker1.start(), broker2.start()]);
    registry.registerRemoteServices(node, [service]);

    await Promise.all([broker1.stop(), broker2.stop()]);
  });
});

describe('Test "getNextAvailableActionEndpoint"', () => {
  it("should return the endpoint if the actionName is not a string", () => {
    const broker = createBroker(brokerSettings);
    const registry = broker.registry;
    const endpoint = {};

    assert.strictEqual(registry.getNextAvailableActionEndpoint(endpoint), endpoint);
  });

  it("should return error for non-existing action", () => {
    const broker = createBroker(brokerSettings);
    const registry = broker.registry;

    const result = registry.getNextAvailableActionEndpoint("test-action", { nodeId: "test-node" });
    assert.strictEqual(result.constructor.name, "WeaveServiceNotFoundError");
  });
});
