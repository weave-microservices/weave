import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { installRedisMock, type RedisMock } from "./redis-mock.mts";

// The module mock has to be registered before the adapter is imported.
const redis = installRedisMock();
let redisMock: RedisMock;

const { default: createRedisAdapter, RedisTransportAdapter } = await import("../lib/index.mts");

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
  options?: Parameters<typeof createRedisAdapter>[0],
  brokerOptions: { namespace?: string } = { namespace: "test" },
) => {
  const logs: LogEntry[] = [];
  const adapter = createRedisAdapter(options);
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

describe("REDIS transport adapter", () => {
  beforeEach(() => {
    redisMock = redis.reset();
  });

  describe("options", () => {
    it("should use the default socket if no options are given", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();

      assert.deepEqual(redisMock.sub.options, {
        socket: { host: "127.0.0.1", port: 6379 },
      });
    });

    it("should map the legacy host and port options to the socket option", async () => {
      const { adapter } = await createAdapter({ host: "redis.local", port: 6380 });

      await adapter.connect();

      assert.deepEqual(redisMock.sub.options, {
        socket: { host: "redis.local", port: 6380 },
      });
    });

    it("should complete a partial socket option with the defaults", async () => {
      const { adapter } = await createAdapter({ socket: { host: "redis.local" } });

      await adapter.connect();

      assert.deepEqual(redisMock.sub.options, {
        socket: { host: "redis.local", port: 6379 },
      });
    });

    it("should map the legacy db option to database", async () => {
      const { adapter } = await createAdapter({ db: 3 });

      await adapter.connect();

      assert.deepEqual(redisMock.sub.options, {
        socket: { host: "127.0.0.1", port: 6379 },
        database: 3,
      });
    });

    it("should pass through native client options", async () => {
      const { adapter } = await createAdapter({
        password: "secret",
        database: 2,
        socket: { host: "redis.local", port: 6380 },
      });

      await adapter.connect();

      assert.deepEqual(redisMock.sub.options, {
        password: "secret",
        database: 2,
        socket: { host: "redis.local", port: 6380 },
      });
    });

    it("should use the same options for both clients", async () => {
      const { adapter } = await createAdapter({ host: "redis.local" });

      await adapter.connect();

      assert.deepEqual(redisMock.pub.options, redisMock.sub.options);
    });

    it("should expose the adapter name", () => {
      assert.equal(new RedisTransportAdapter().name, "REDIS");
    });
  });

  describe("connect", () => {
    it("should connect a subscriber and a publisher client", async () => {
      const { adapter, logs, busEvents } = await createAdapter();

      await adapter.connect();

      assert.equal(redisMock.clients.length, 2);
      assert.equal(redisMock.sub.connectCalls, 1);
      assert.equal(redisMock.pub.connectCalls, 1);
      assert.equal(adapter.isConnected, true);
      assert.ok(logs.some((entry) => entry.message === "Redis SUB client connected."));
      assert.ok(logs.some((entry) => entry.message === "Redis PUB client connected."));

      const connectedEvents = busEvents.filter((event) => event.event === "$adapter.connected");

      assert.equal(connectedEvents.length, 1);
      assert.deepEqual(connectedEvents[0].args[0], { wasReconnect: false });
    });

    it("should propagate and log connection errors", async () => {
      const { adapter, logs } = await createAdapter();

      redisMock.failNextConnect(new Error("ECONNREFUSED"));

      await assert.rejects(() => adapter.connect(), /ECONNREFUSED/);
      assert.equal(adapter.isConnected, false);
      assert.ok(
        logs.some(
          (entry) =>
            entry.level === "error" && entry.message === "Redis connection error: ECONNREFUSED",
        ),
      );
    });
  });

  describe("subscribe", () => {
    it("should subscribe to a prefixed topic", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.subscribe("INFO", "node2");

      assert.equal(redisMock.sub.subscriptions.length, 1);
      assert.equal(redisMock.sub.subscriptions[0].channel, "weave-test.INFO.node2");
    });

    it("should subscribe without a node id", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.subscribe("DISCOVER");

      assert.equal(redisMock.sub.subscriptions[0].channel, "weave-test.DISCOVER");
    });

    it("should not use a namespace prefix if no namespace is configured", async () => {
      const { adapter } = await createAdapter(undefined, {});

      await adapter.connect();
      await adapter.subscribe("INFO");

      assert.equal(redisMock.sub.subscriptions[0].channel, "weave.INFO");
    });

    it("should emit incoming messages on the adapter bus", async () => {
      const { adapter, busEvents, transport } = await createAdapter();

      await adapter.connect();
      await adapter.subscribe("INFO", "node2");

      const message = JSON.stringify({ type: "INFO", payload: { sender: "node2" } });
      redisMock.sub.subscriptions[0].emit(message);

      const messageEvents = busEvents.filter((event) => event.event === "$adapter.message");

      assert.equal(messageEvents.length, 1);
      assert.equal(messageEvents[0].args[0], "INFO");
      assert.deepEqual(messageEvents[0].args[1], { type: "INFO", payload: { sender: "node2" } });
      assert.equal(transport.statistics.received.packages, message.length);
    });

    it("should keep the message type of a namespace containing a dot", async () => {
      const { adapter, busEvents } = await createAdapter(undefined, { namespace: "my.namespace" });

      await adapter.connect();
      await adapter.subscribe("INFO", "node2");

      assert.equal(redisMock.sub.subscriptions[0].channel, "weave-my.namespace.INFO.node2");

      redisMock.sub.subscriptions[0].emit(JSON.stringify({ type: "INFO", payload: {} }));

      const [messageEvent] = busEvents.filter((event) => event.event === "$adapter.message");

      assert.equal(messageEvent.args[0], "INFO");
    });

    it("should ignore subscriptions if the adapter is not connected", async () => {
      const { adapter } = await createAdapter();

      await adapter.subscribe("INFO", "node2");

      assert.equal(redisMock.clients.length, 0);
    });
  });

  describe("send", () => {
    it("should publish a serialized message on the topic of the target node", async () => {
      const { adapter, transport } = await createAdapter();

      await adapter.connect();
      await adapter.send({ type: "REQUEST", targetNodeId: "node2", payload: {} } as never);

      assert.equal(redisMock.pub.published.length, 1);

      const [published] = redisMock.pub.published;
      assert.equal(published.channel, "weave-test.REQUEST.node2");
      assert.deepEqual(JSON.parse(published.message), {
        type: "REQUEST",
        targetNodeId: "node2",
        payload: { sender: "node1" },
      });
      assert.equal(transport.statistics.sent.packages, Buffer.byteLength(published.message));
    });

    it("should publish without a target node id", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.send({ type: "DISCOVER", payload: {} } as never);

      assert.equal(redisMock.pub.published[0].channel, "weave-test.DISCOVER");
    });

    it("should not publish if the adapter is not connected", async () => {
      const { adapter } = await createAdapter();

      await adapter.send({ type: "REQUEST", payload: {} } as never);

      assert.equal(redisMock.clients.length, 0);
    });

    it("should not publish while the connection is interrupted", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      redisMock.pub.emit("end");

      await adapter.send({ type: "REQUEST", payload: {} } as never);

      assert.equal(redisMock.pub.published.length, 0);
    });
  });

  describe("client events", () => {
    it("should log client errors without changing the connection state", async () => {
      const { adapter, logs, busEvents } = await createAdapter();

      await adapter.connect();
      redisMock.sub.emit("error", new Error("connection reset"));

      assert.ok(
        logs.some(
          (entry) => entry.level === "error" && entry.message === "Redis SUB error: connection reset",
        ),
      );
      assert.equal(adapter.isConnected, true);
      assert.equal(busEvents.filter((event) => event.event === "$adapter.disconnected").length, 0);
    });

    it("should handle a disconnect", async () => {
      const { adapter, logs, busEvents } = await createAdapter();

      await adapter.connect();
      redisMock.sub.emit("end");

      assert.equal(adapter.isConnected, false);
      assert.equal(adapter.interruptionCount, 1);
      assert.ok(logs.some((entry) => entry.message === "Redis SUB disconnected."));
      assert.equal(busEvents.filter((event) => event.event === "$adapter.disconnected").length, 1);
    });

    it("should report a disconnect only once for both clients", async () => {
      const { adapter, busEvents } = await createAdapter();

      await adapter.connect();
      redisMock.sub.emit("end");
      redisMock.pub.emit("end");

      assert.equal(adapter.interruptionCount, 1);
      assert.equal(busEvents.filter((event) => event.event === "$adapter.disconnected").length, 1);
    });

    it("should log a reconnect attempt", async () => {
      const { adapter, logs } = await createAdapter();

      await adapter.connect();
      redisMock.sub.emit("reconnecting");

      assert.ok(logs.some((entry) => entry.message === "Redis SUB client is reconnecting..."));
    });

    it("should emit the connected event once both clients are ready again", async () => {
      const { adapter, logs, busEvents } = await createAdapter();

      await adapter.connect();
      redisMock.sub.emit("end");

      // only the subscriber is back - not enough to consider the adapter connected
      redisMock.pub.isReady = false;
      redisMock.sub.emit("ready");

      assert.equal(adapter.isConnected, false);
      assert.equal(busEvents.filter((event) => event.event === "$adapter.connected").length, 1);

      redisMock.pub.isReady = true;
      redisMock.pub.emit("ready");

      assert.equal(adapter.isConnected, true);
      assert.ok(logs.some((entry) => entry.message === "Redis clients reconnected."));

      const connectedEvents = busEvents.filter((event) => event.event === "$adapter.connected");

      assert.equal(connectedEvents.length, 2);
      assert.deepEqual(connectedEvents[1].args[0], { wasReconnect: true });
    });

    it("should ignore ready events while the adapter is connected", async () => {
      const { adapter, busEvents } = await createAdapter();

      await adapter.connect();
      redisMock.sub.emit("ready");

      assert.equal(busEvents.filter((event) => event.event === "$adapter.connected").length, 1);
    });

    it("should ignore ready events if the connection was never interrupted", async () => {
      const { adapter, busEvents } = await createAdapter();

      await adapter.connect();
      adapter.isConnected = false;
      redisMock.sub.emit("ready");

      assert.equal(adapter.isConnected, false);
      assert.equal(busEvents.filter((event) => event.event === "$adapter.connected").length, 1);
    });

    it("should mark a reconnect as such on a manual reconnect", async () => {
      const { adapter, busEvents } = await createAdapter();

      await adapter.connect();
      redisMock.sub.emit("end");

      await adapter.close();
      await adapter.connect();

      const connectedEvents = busEvents.filter((event) => event.event === "$adapter.connected");

      assert.deepEqual(connectedEvents.at(-1)?.args[0], { wasReconnect: true });
    });
  });

  describe("close", () => {
    it("should close both clients", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.close();

      assert.equal(redisMock.sub.closeCalls, 1);
      assert.equal(redisMock.pub.closeCalls, 1);
      assert.equal(adapter.isConnected, false);
    });

    it("should do nothing if the adapter was never connected", async () => {
      const { adapter } = await createAdapter();

      await adapter.close();

      assert.equal(redisMock.clients.length, 0);
    });

    it("should tolerate being closed twice", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      await adapter.close();
      await adapter.close();

      assert.equal(redisMock.sub.closeCalls, 1);
      assert.equal(redisMock.pub.closeCalls, 1);
    });

    it("should not close an already closed client", async () => {
      const { adapter } = await createAdapter();

      await adapter.connect();
      redisMock.sub.isOpen = false;

      await adapter.close();

      assert.equal(redisMock.sub.closeCalls, 0);
      assert.equal(redisMock.pub.closeCalls, 1);
    });
  });
});
