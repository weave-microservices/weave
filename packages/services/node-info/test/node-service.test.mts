import { describe, it } from "node:test";
import assert from "node:assert/strict";
import nodeService, { actions, name, type AggregatedService } from "../lib/node-service.mts";

interface RegistryListCall {
  collection: string;
  params: unknown;
}

/**
 * Creates a service double exposing a registry that returns the given lists.
 */
const createServiceMock = (lists: {
  services?: unknown[];
  actions?: unknown[];
  events?: unknown[];
  nodes?: unknown[];
}) => {
  const calls: RegistryListCall[] = [];

  const collection = (collectionName: string, result: unknown[] = []) => ({
    list: (params: unknown) => {
      calls.push({ collection: collectionName, params });
      return result;
    },
  });

  const service = {
    runtime: {
      registry: {
        serviceCollection: collection("services", lists.services),
        actionCollection: collection("actions", lists.actions),
        eventCollection: collection("events", lists.events),
        nodeCollection: collection("nodes", lists.nodes),
      },
    },
  };

  return { service, calls };
};

const callAction = <T,>(
  action: { handler: (...args: never[]) => unknown },
  service: unknown,
  data: unknown,
): T => action.handler.call(service as never, { data } as never) as T;

describe("$node service", () => {
  it("should be named $node", () => {
    assert.equal(name, "$node");
    assert.equal(nodeService.name, "$node");
  });

  it("should expose four actions", () => {
    assert.deepEqual(Object.keys(nodeService.actions ?? {}), [
      "services",
      "actions",
      "events",
      "list",
    ]);
  });

  describe("$node.services", () => {
    it("should list a service with the node it runs on", () => {
      const { service } = createServiceMock({
        services: [{ name: "math", version: 1, nodeId: "node1" }],
      });

      const result = callAction<AggregatedService[]>(actions.services, service, {});

      assert.deepEqual(result, [{ name: "math", version: 1, nodes: ["node1"] }]);
    });

    it("should pass the parameters to the registry", () => {
      const { service, calls } = createServiceMock({ services: [] });

      callAction(actions.services, service, { withActions: true, withNodeService: true });

      assert.deepEqual(calls, [
        { collection: "services", params: { withActions: true, withNodeService: true } },
      ]);
    });

    it("should aggregate the nodes of a service running on multiple nodes", () => {
      const { service } = createServiceMock({
        services: [
          { name: "math", version: 1, nodeId: "node1" },
          { name: "math", version: 1, nodeId: "node2" },
        ],
      });

      const result = callAction<AggregatedService[]>(actions.services, service, {});

      assert.equal(result.length, 1);
      assert.deepEqual(result[0].nodes, ["node1", "node2"]);
    });

    it("should keep different versions of a service apart", () => {
      const { service } = createServiceMock({
        services: [
          { name: "math", version: 1, nodeId: "node1" },
          { name: "math", version: 2, nodeId: "node2" },
        ],
      });

      const result = callAction<AggregatedService[]>(actions.services, service, {});

      assert.equal(result.length, 2);
      assert.deepEqual(
        result.map((entry) => entry.version),
        [1, 2],
      );
    });

    it("should omit the handler and service properties of an action", () => {
      const { service } = createServiceMock({
        services: [
          {
            name: "math",
            version: 1,
            nodeId: "node1",
            actions: {
              "math.add": {
                name: "math.add",
                handler: () => undefined,
                service: { name: "math" },
                metrics: true,
              },
            },
          },
        ],
      });

      const result = callAction<AggregatedService[]>(actions.services, service, {
        withActions: true,
      });

      assert.deepEqual(result[0].actions, {
        "math.add": { name: "math.add", metrics: true },
      });
    });

    it("should keep the actions of all nodes of a service", () => {
      const { service } = createServiceMock({
        services: [
          {
            name: "math",
            version: 1,
            nodeId: "node1",
            actions: { "math.add": { name: "math.add" } },
          },
          {
            name: "math",
            version: 1,
            nodeId: "node2",
            actions: { "math.sub": { name: "math.sub" } },
          },
        ],
      });

      const result = callAction<AggregatedService[]>(actions.services, service, {
        withActions: true,
      });

      assert.equal(result.length, 1);
      assert.deepEqual(Object.keys(result[0].actions ?? {}), ["math.add", "math.sub"]);
    });

    it("should not overwrite an action that is already known", () => {
      const { service } = createServiceMock({
        services: [
          {
            name: "math",
            version: 1,
            nodeId: "node1",
            actions: { "math.add": { name: "math.add", origin: "node1" } },
          },
          {
            name: "math",
            version: 1,
            nodeId: "node2",
            actions: { "math.add": { name: "math.add", origin: "node2" } },
          },
        ],
      });

      const result = callAction<AggregatedService[]>(actions.services, service, {
        withActions: true,
      });

      assert.equal(result[0].actions?.["math.add"].origin, "node1");
    });

    it("should not add an actions property if the registry returns none", () => {
      const { service } = createServiceMock({
        services: [{ name: "math", version: 1, nodeId: "node1" }],
      });

      const result = callAction<AggregatedService[]>(actions.services, service, {});

      assert.equal("actions" in result[0], false);
    });

    it("should return an empty list if no service is registered", () => {
      const { service } = createServiceMock({ services: [] });

      assert.deepEqual(callAction(actions.services, service, {}), []);
    });
  });

  describe("$node.actions, $node.events and $node.list", () => {
    it("should return the actions of the registry", () => {
      const { service, calls } = createServiceMock({ actions: [{ name: "math.add" }] });

      const result = callAction(actions.actions, service, { withEndpoints: true });

      assert.deepEqual(result, [{ name: "math.add" }]);
      assert.deepEqual(calls, [{ collection: "actions", params: { withEndpoints: true } }]);
    });

    it("should return the events of the registry", () => {
      const { service, calls } = createServiceMock({ events: [{ name: "user.created" }] });

      const result = callAction(actions.events, service, { withEndpoints: true });

      assert.deepEqual(result, [{ name: "user.created" }]);
      assert.deepEqual(calls, [{ collection: "events", params: { withEndpoints: true } }]);
    });

    it("should return the nodes of the registry", () => {
      const { service, calls } = createServiceMock({ nodes: [{ id: "node1" }] });

      const result = callAction(actions.list, service, { withServices: true });

      assert.deepEqual(result, [{ id: "node1" }]);
      assert.deepEqual(calls, [{ collection: "nodes", params: { withServices: true } }]);
    });
  });
});
