import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { installNatsMock, type NatsMock } from "./nats-mock.mts";

// The module mock has to be registered before the adapter is imported.
const nats = installNatsMock();
let natsMock: NatsMock;

const { default: createNATSAdapter, NATSTransportAdapter } = await import("../lib/index.mts");

interface LogEntry {
  level: string;
  message: string;
}

const createBrokerMock = (namespace?: string) => ({
  nodeId: "node1",
  options: { namespace },
  handleError: (error: Error) => {
    throw error;
  },
});

const createTransportMock = (logs: LogEntry[]) => ({
  log: {
    info: (message: string) => logs.push({ level: "info", message }),
    warn: (message: string) => logs.push({ level: "warn", message }),
    error: (message: string) => logs.push({ level: "error", message }),
    debug: (message: string) => logs.push({ level: "debug", message }),
  },
  statistics: {
    received: { packages: 0 },
    sent: { packages: 0 },
  },
});

/**
 * Creates an initialized adapter together with its test doubles.
 */
const createAdapter = async (
  options?: Parameters<typeof createNATSAdapter>[0],
  brokerOptions: { namespace?: string } = { namespace: "test" },
) => {
  const logs: LogEntry[] = [];
  const adapter = createNATSAdapter(options);
  const transport = createTransportMock(logs);
  const busEvents: Array<{ event: string; args: unknown[] }> = [];

  for (const event of ["$adapter.connected", "$adapter.disconnected", "$adapter.message"]) {
    adapter.bus.on(event, (...args: unknown[]) => busEvents.push({ event, args }));
  }

  await adapter.init(
    createBrokerMock(brokerOptions.namespace) as never,
    transport as never,
    (() => {}) as never,
  );

  return { adapter, logs, busEvents, transport };
};

/** Lets the status watcher process pending events. */
const tick = () => new Promise((resolve) => setImmediate(resolve));

describe("NATS transport adapter", () => {
  beforeEach(() => {
    natsMock = nats.reset();
  });

  afterEach(() => {
    natsMock.dispose();
  });

  describe("options", () => {
    it("should use the default server if no options are given", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();

      assert.deepEqual(natsMock.connectOptions, { servers: "nats://localhost:4222" });

      await adapter.close();
    });

    it("should accept a connection string as adapter options", async () => {
      const { adapter } = await createAdapter("nats://nats.local:4222");

      await adapter.connect();

      assert.deepEqual(natsMock.connectOptions, { servers: "nats://nats.local:4222" });

      await adapter.close();
    });

    it("should map the legacy url option to servers", async () => {
      const { adapter } = await createAdapter({ url: "nats://legacy:4222" });

      await adapter.connect();

      assert.deepEqual(natsMock.connectOptions, { servers: "nats://legacy:4222" });

      await adapter.close();
    });

    it("should pass through native connection options", async () => {
      const { adapter } = await createAdapter({
        servers: ["nats://one:4222", "nats://two:4222"],
        name: "weave-node",
        maxReconnectAttempts: 3,
      });

      await adapter.connect();

      assert.deepEqual(natsMock.connectOptions, {
        servers: ["nats://one:4222", "nats://two:4222"],
        name: "weave-node",
        maxReconnectAttempts: 3,
      });

      await adapter.close();
    });

    it("should expose the adapter name", () => {
      assert.equal(new NATSTransportAdapter().name, "NATS");
    });
  });

  describe("connect", () => {
    it("should connect and emit the connected event", async () => {
      const { adapter, logs, busEvents } = await createAdapter();

      await adapter.connect();

      assert.equal(natsMock.connectCalls, 1);
      assert.equal(adapter.isConnected, true);
      assert.ok(logs.some((entry) => entry.message === "NATS client connected."));
      assert.equal(busEvents.filter((event) => event.event === "$adapter.connected").length, 1);

      await adapter.close();
    });

    it("should propagate connection errors", async () => {
      const { adapter } = await createAdapter();

      natsMock.failNextConnect(new Error("no servers available"));

      await assert.rejects(() => adapter.connect(), /no servers available/);
      assert.equal(adapter.isConnected, false);
    });
  });

  describe("subscribe", () => {
    it("should subscribe to a prefixed topic", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.subscribe("INFO", "node2");

      assert.equal(natsMock.subscriptions.length, 1);
      assert.equal(natsMock.subscriptions[0].subject, "weave-test.INFO.node2");

      await adapter.close();
    });

    it("should subscribe without a node id", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.subscribe("DISCOVER");

      assert.equal(natsMock.subscriptions[0].subject, "weave-test.DISCOVER");

      await adapter.close();
    });

    it("should not use a namespace prefix if no namespace is configured", async () => {
      const { adapter } = await createAdapter(undefined, {});

      await adapter.connect();
      await adapter.subscribe("INFO");

      assert.equal(natsMock.subscriptions[0].subject, "weave.INFO");

      await adapter.close();
    });

    it("should emit incoming messages on the adapter bus", async () => {
      const { adapter, busEvents, transport } = await createAdapter();

      await adapter.connect();
      await adapter.subscribe("INFO", "node2");

      const message = JSON.stringify({ type: "INFO", payload: { sender: "node2" } });
      natsMock.subscriptions[0].emit(message);

      const messageEvents = busEvents.filter((event) => event.event === "$adapter.message");

      assert.equal(messageEvents.length, 1);
      assert.equal(messageEvents[0].args[0], "INFO");
      assert.deepEqual(messageEvents[0].args[1], { type: "INFO", payload: { sender: "node2" } });
      assert.equal(transport.statistics.received.packages, Buffer.byteLength(message));

      await adapter.close();
    });

    it("should log subscription errors without emitting a message", async () => {
      const { adapter, logs, busEvents } = await createAdapter();

      await adapter.connect();
      await adapter.subscribe("INFO", "node2");

      natsMock.subscriptions[0].emitError(new Error("permissions violation"));

      assert.ok(
        logs.some(
          (entry) => entry.level === "error" && entry.message.includes("permissions violation"),
        ),
      );
      assert.equal(busEvents.filter((event) => event.event === "$adapter.message").length, 0);

      await adapter.close();
    });

    it("should ignore subscriptions if the adapter is not connected", async () => {
      const { adapter } = await createAdapter();

      await adapter.subscribe("INFO", "node2");

      assert.equal(natsMock.subscriptions.length, 0);
    });
  });

  describe("send", () => {
    it("should publish a serialized message on the topic of the target node", async () => {
      const { adapter, transport } = await createAdapter();

      await adapter.connect();
      await adapter.send({ type: "REQUEST", targetNodeId: "node2", payload: {} } as never);

      assert.equal(natsMock.published.length, 1);

      const [published] = natsMock.published;
      assert.equal(published.subject, "weave-test.REQUEST.node2");

      const payload = JSON.parse(Buffer.from(published.payload).toString());
      assert.deepEqual(payload, {
        type: "REQUEST",
        targetNodeId: "node2",
        payload: { sender: "node1" },
      });
      assert.equal(transport.statistics.sent.packages, published.payload.length);

      await adapter.close();
    });

    it("should publish without a target node id", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.send({ type: "DISCOVER", payload: {} } as never);

      assert.equal(natsMock.published[0].subject, "weave-test.DISCOVER");

      await adapter.close();
    });

    it("should not publish if the adapter is not connected", async () => {
      const { adapter } = await createAdapter();

      await adapter.send({ type: "REQUEST", payload: {} } as never);

      assert.equal(natsMock.published.length, 0);
    });

    it("should not publish while the connection is interrupted", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();

      natsMock.pushStatus({ type: "disconnect" });
      await tick();

      await adapter.send({ type: "REQUEST", payload: {} } as never);

      assert.equal(natsMock.published.length, 0);

      await adapter.close();
    });
  });

  describe("status handling", () => {
    it("should handle a disconnect", async () => {
      const { adapter, logs, busEvents } = await createAdapter();

      await adapter.connect();

      natsMock.pushStatus({ type: "disconnect" });
      await tick();

      assert.equal(adapter.isConnected, false);
      assert.equal(adapter.interruptionCount, 1);
      assert.ok(logs.some((entry) => entry.message === "NATS client disconnected."));
      assert.equal(busEvents.filter((event) => event.event === "$adapter.disconnected").length, 1);

      await adapter.close();
    });

    it("should ignore a disconnect if the adapter is already disconnected", async () => {
      const { adapter, busEvents } = await createAdapter();

      await adapter.connect();

      natsMock.pushStatus({ type: "disconnect" });
      natsMock.pushStatus({ type: "disconnect" });
      await tick();

      assert.equal(adapter.interruptionCount, 1);
      assert.equal(busEvents.filter((event) => event.event === "$adapter.disconnected").length, 1);

      await adapter.close();
    });

    it("should log a reconnect attempt", async () => {
      const { adapter, logs } = await createAdapter();

      await adapter.connect();

      natsMock.pushStatus({ type: "reconnecting" });
      await tick();

      assert.ok(logs.some((entry) => entry.message === "NATS client is reconnecting..."));

      await adapter.close();
    });

    it("should emit the connected event on a reconnect", async () => {
      const { adapter, logs, busEvents } = await createAdapter();

      await adapter.connect();

      natsMock.pushStatus({ type: "disconnect" });
      await tick();
      natsMock.pushStatus({ type: "reconnect" });
      await tick();

      assert.equal(adapter.isConnected, true);
      assert.ok(logs.some((entry) => entry.message === "NATS client reconnected."));

      const connectedEvents = busEvents.filter((event) => event.event === "$adapter.connected");

      assert.equal(connectedEvents.length, 2);
      assert.deepEqual(connectedEvents[1].args[0], { wasReconnect: true });

      await adapter.close();
    });

    it("should ignore a reconnect if the adapter is still connected", async () => {
      const { adapter, busEvents } = await createAdapter();

      await adapter.connect();

      natsMock.pushStatus({ type: "reconnect" });
      await tick();

      assert.equal(busEvents.filter((event) => event.event === "$adapter.connected").length, 1);

      await adapter.close();
    });

    it("should log async server errors", async () => {
      const { adapter, logs } = await createAdapter();

      await adapter.connect();

      natsMock.pushStatus({ type: "error", data: "AUTHORIZATION_VIOLATION" });
      await tick();

      assert.ok(
        logs.some(
          (entry) =>
            entry.level === "error" && entry.message === "NATS error AUTHORIZATION_VIOLATION",
        ),
      );

      await adapter.close();
    });

    it("should ignore unknown status events", async () => {
      const { adapter, logs } = await createAdapter();

      await adapter.connect();

      const logCount = logs.length;
      natsMock.pushStatus({ type: "ldm" });
      await tick();

      assert.equal(logs.length, logCount);
      assert.equal(adapter.isConnected, true);

      await adapter.close();
    });
  });

  describe("close", () => {
    it("should drain the connection", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.close();

      assert.equal(natsMock.drainCalls, 1);
      assert.equal(adapter.isConnected, false);
    });

    it("should do nothing if the adapter was never connected", async () => {
      const { adapter } = await createAdapter();

      await adapter.close();

      assert.equal(natsMock.drainCalls, 0);
    });

    it("should tolerate being closed twice", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.close();
      await adapter.close();

      assert.equal(natsMock.drainCalls, 1);
    });

    it("should not drain an already closed connection", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      natsMock.markClosed();

      await adapter.close();

      assert.equal(natsMock.drainCalls, 0);
      assert.equal(adapter.isConnected, false);
    });
  });
});
