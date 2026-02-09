import createDiscoveryService from "../../../../lib/transport/adapters/tcp/discovery/index.mts";
import { getIpList } from "@weave-js/utils";
import { describe, it, beforeEach, mock } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "events";
import type { TransportAdapter } from "../../../../types/index.js";

interface DiscoveryMessage {
  namespace: string;
  nodeId: string;
  port: number;
  host?: string;
}

const fakeAdapter = (nodeId: string): TransportAdapter => ({
  name: "fake",
  bus: new EventEmitter(),
  broker: {
    nodeId,
    options: {
      namespace: "",
    },
  } as TransportAdapter["broker"],
  log: {
    info: mock.fn(),
    verbose: mock.fn(),
  } as unknown as TransportAdapter["log"],
  isConnected: false,
  interruptCounter: 0,
  repeatAttemptCounter: 0,
  init: async () => {},
  connect: async () => {},
  close: async () => {},
  subscribe: async () => {},
  send: async () => {},
  preSend: async () => {},
  incomingMessage: () => {},
  serialize: () => Buffer.from(""),
  deserialize: () => ({ type: "", target: "", payload: {} }),
  connected: () => {},
  disconnected: () => {},
  getTopic: () => "",
  updateStatisticReceived: () => {},
  updateStatisticSent: () => {},
});

const options = {
  discovery: {
    enabled: true,
    port: 1234,
    type: "udp4" as const,
    udpReuseAddress: true,
  },
};

describe("UDP discovery", () => {
  const ips: string[] = getIpList(false);

  let discoveryService: ReturnType<typeof createDiscoveryService>;
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

    const messages = new Map<string, DiscoveryMessage>();

    secondDiscoveryService.bus.on("message", (message: DiscoveryMessage) => {
      messages.set(message.host!, message);
    });

    await new Promise<void>((r) => setTimeout(() => r(), 2000));

    ips.forEach((ip) => {
      const message = messages.get(ip);
      if (!message) return;
      assert.ok(ips.includes(message.host!), "Expected host to be in IP list");
      assert.strictEqual(message.namespace, "");
      assert.strictEqual(message.nodeId, "node1");
      assert.strictEqual(message.port, 1234);
    });
  });
});
