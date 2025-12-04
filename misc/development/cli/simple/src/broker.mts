import { createBroker, TransportAdapters } from "@weave-js/core";

const broker1 = createBroker({
  nodeId: "node1",
  transport: {
    adapter: TransportAdapters.Dummy(),
  },
});

const broker2 = createBroker({
  nodeId: "node2",
  transport: {
    adapter: TransportAdapters.Dummy(),
  },
});

broker1.createService({
  name: "test",
  events: {
    saidHello: {
      params: {
        name: "string",
        age: { type: "number" },
      },
      handler(context) {
        console.log("sdas");
      },
    },
  },
  actions: {
    hello: {
      params: {
        name: "string",
        age: { type: "number" },
      },
      responseSchema: {
        type: "string",
      },
      handler(context) {
        return context.data;
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
          properties: {
            enabled: { type: "boolean" },
            timeout: { type: "number" },
            internalSettings: {
              type: "object",
              properties: {
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

await broker2.call("test.hello", { name: "test", age: 123 });

await broker2.call("external.makeSomething", { email: "test", settings: { enabled: true, timeout: 123 } });
await broker1.call("internal.makeSomethingInternal", { email: "test", settings: { enabled: true, timeout: 123, internalSettings: { enabled: true, timeout: 123 } } });
broker1.emit("saidHello", { name: "test", age: "123" });
