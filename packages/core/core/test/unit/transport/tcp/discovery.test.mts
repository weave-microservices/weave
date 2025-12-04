import createDiscoveryService from "../../../../lib/transport/adapters/tcp/discovery/index.mts";
import { getIpList } from "@weave-js/utils";
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

const fakeAdapter = (nodeId) => ({
  broker: {
    nodeId,
    options: {
      namespace: "",
    },
  },
  log: {
    info: jest.fn(),
    verbose: jest.fn(),
  },
});

const options = {
  discovery: {
    enabled: true,
    port: 1234,
    type: "udp4",
    udpReuseAddress: true,
  },
};

describe("UDP discovery", () => {
  const ips = getIpList(false);

  let discoveryService;
  beforeEach(() => {
    discoveryService = createDiscoveryService(fakeAdapter("node1"), options);
  });

  it("should expect interface", async () => {
    assert.notStrictEqual(discoveryService.bus, undefined);
    assert.notStrictEqual(discoveryService.start, undefined);
    assert.notStrictEqual(discoveryService.close, undefined);
  });

  it("should discover", async () => {
    const secondDiscoveryService = createDiscoveryService(fakeAdapter("node2"), options);
    await discoveryService.start(1234);
    await secondDiscoveryService.start(1234);

    const messages = new Map();

    secondDiscoveryService.bus.on("message", (message) => {
      messages.set(message.host, message);
    });

    await new Promise((r) => setTimeout(() => r(), 2000));

    ips.forEach((ip) => {
      const message = messages.get(ip);
      if (!message) return;
      expect(ips.includes(message.host)).toBeTruthy();
      assert.strictEqual(message.namespace, "");
      assert.strictEqual(message.nodeId, "node1");
      assert.strictEqual(message.port, 1234);
    });
  });
});
