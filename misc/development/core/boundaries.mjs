import {
  createBroker,
  TransportAdapters,
  defineAction,
} from "@weave-js/core/lib/index.mts";
import repl from "../../../packages/core/repl/lib/index.mts";

const gwBroker = createBroker({
  nodeId: "gateway",
  transport: {
    adapter: TransportAdapters.Dummy(),
  },
});

const workerBroker = createBroker({
  nodeId: "worker",
  transport: {
    adapter: TransportAdapters.Dummy(),
  },
});

workerBroker.createService({
  name: "greeter",
  actions: {
    sayHello: defineAction({
      params: {
        test: { type: "boolean" },
        name: { type: "boolean" },
        email: { type: "email" },
        settings: {
          type: "object",
          props: {
            isActive: { type: "boolean" },
          },
        },
        age: { type: "number" },
      },
      visibility: "private",
      handler(context) {
        return "hello";
      },
    }),
  },
});

workerBroker.createService({
  name: "user",
  actions: {
    getUsers: {
      visibility: "private",
      handler(context) {
        return ["manfred"];
      },
    },
  },
});

await Promise.all([gwBroker.start(), workerBroker.start()]);
repl(gwBroker);
