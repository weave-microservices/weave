import { createNode } from "../../../lib/registry/node.mts";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const createMockPayload = () => {
  return {
    sequence: 1,
    services: [],
    events: [],
    client: {
      type: "node.js",
      version: "0.1",
    },
    IPList: [],
    info: {},
    cpu: 20,
    cpuSequence: 2,
  };
};

describe("Node instance", () => {
  it("should create a node instance", () => {
    const node = createNode("test-node");

    assert.strictEqual(node.id, "test-node");
    assert.strictEqual(node.isAvailable, true);
    assert.strictEqual(node.isLocal, false);
    assert.strictEqual(node.info, null);
    assert.strictEqual(node.cpu, null);
    assert.strictEqual(node.cpuSequence, null);
    assert.strictEqual(node.events, null);
    assert.ok(Array.isArray(node.IPList));
    assert.notStrictEqual(node.lastHeartbeatTime, undefined);
    assert.strictEqual(node.offlineTime, null);
  });
});

describe("Node lifetime", () => {
  const node = createNode("test-node");
  let lastHeartbeat: number;

  it("should create a node instance", () => {
    assert.strictEqual(node.isAvailable, true);
    lastHeartbeat = node.lastHeartbeatTime;
  });

  it("should handle heartbeat", () => {
    const payload = createMockPayload();
    node.heartbeat(payload);
    assert.ok(node.lastHeartbeatTime > lastHeartbeat);
    assert.strictEqual(node.cpu, 20);
    assert.strictEqual(node.cpuSequence, 2);
  });

  it("should handle disconnect and set unavailable", () => {
    node.disconnected();
    assert.ok(node.offlineTime !== null && node.offlineTime > 0);
    assert.strictEqual(node.isAvailable, false);
    assert.strictEqual(node.sequence, 1);
  });

  it("should set node available after a new heartbeat package", () => {
    const payload = createMockPayload();
    node.heartbeat(payload);
    assert.strictEqual(node.offlineTime, null);
    assert.strictEqual(node.isAvailable, true);
    assert.strictEqual(node.sequence, 1);
  });
});
