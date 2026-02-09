import { createServiceCollection } from "../../../lib/registry/collections/serviceCollection.mts";
import { createNode } from "../../../lib/registry/node.mts";
import { createMockRegistry } from "../../helper/mock-registry.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Registry } from "../../../types/index.js";

describe("Service collection", () => {
  it("should add and list services to a service collection", () => {
    const serviceCollection = createServiceCollection(
      createMockRegistry({ runtimeOptions: { nodeId: "test-node" } }) as unknown as Registry,
    );
    const node = createNode("test-node");
    serviceCollection.add(node, "test-service", "1.0.0", {
      $private: true,
    });

    serviceCollection.add(node, "test-service2", "1.0.0", {});

    const listWithoutPrivate = serviceCollection.list({});
    assert.strictEqual(listWithoutPrivate.length, 1);

    const listWithPrivate = serviceCollection.list({ withPrivate: true });
    assert.strictEqual(listWithPrivate.length, 2);
  });
});
