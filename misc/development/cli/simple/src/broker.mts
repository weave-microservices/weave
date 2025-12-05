import { createBroker, TransportAdapters } from "@weave-js/core";

const broker1 = createBroker({
  nodeId: "node1",
  logger: {
    level: "debug",
  },
  transport: {
    adapter: TransportAdapters.TCP(),
  },
});

const broker2 = createBroker({
  nodeId: "node2",
  logger: {
    level: "debug",
  },
  transport: {
    adapter: TransportAdapters.TCP(),
  },
});

broker1.createService({
  name: "test",
  events: {
    saidHello: {
      handler(context) {
        context.log?.info("Hello event calle 🤘");
      },
    },
  },
  actions: {
    hello: {
      params: {
        name: { type: "string" },
        age: { type: "number" },
      },
      handler(context) {
        return "from hello";
      },
    },
  },
});

broker1.createService({
  name: "external",
  actions: {
    makeSomething: {
      params: {
        email: { type: "string" },
        settings: {
          type: "object",
          properties: {
            enabled: { type: "boolean" },
            timeout: { type: "number" },
          },
        },
      },
      handler(context) {
        return "require('./external/external-test').makeSomething()";
      },
    },
  },
});

broker2.createService({
  name: "internal",
  actions: {
    makeSomethingInternal: {
      params: {
        email: { type: "string" },
        settings: {
          type: "object",
          props: {
            enabled: { type: "boolean" },
            timeout: { type: "number" },
            internalSettings: {
              type: "object",
              props: {
                enabled: { type: "boolean" },
                timeout: { type: "number" },
              },
            },
          },
        },
      },
      handler(context) {
        return "require('./external/external-test').makeSomething()";
      },
    },
  },
});

await broker1.start();
await broker2.start();

await broker1.waitForServices(["internal"]);
await broker2.waitForServices(["test"]);

try {
  // Local call to see the logger in action
  broker1.emit("saidHello", { name: "test", age: 1 });
  const result = await broker1.call("test.hello", { name: "test", age: 123 });
  console.log(result);

  const result2 = await broker2.call("test.hello", { name: "test", age: 123 });
  console.log("test.hello fired", result2);
  await broker2.call("external.makeSomething", {
    email: "test",
    settings: { enabled: true, timeout: 123 },
  });
  await broker1.call("internal.makeSomethingInternal", {
    email: "test",
    settings: { enabled: true, timeout: 123, internalSettings: { enabled: true, timeout: 123 } },
  });
  await broker1.stop();
  await broker2.stop();
} catch (e) {
  console.log(e);
}
