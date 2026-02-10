/**
 * Explorer Test Broker
 *
 * Start with: npm start
 * Then open: http://localhost:3000
 */

import { createBroker, TransportAdapters } from "@weave-js/core";
import { startExplorer } from "@weave-js/explorer";

const broker = createBroker({
  nodeId: "explorer-main",
  transport: {
    adapter: TransportAdapters.TCP(),
  },
  logger: {
    level: "info",
  },
});

// Math Service
broker.createService({
  name: "math",
  actions: {
    add: {
      params: {
        a: { type: "number" },
        b: { type: "number" },
      },
      handler(ctx) {
        return ctx.data.a + ctx.data.b;
      },
    },
    subtract: {
      params: {
        a: { type: "number" },
        b: { type: "number" },
      },
      handler(ctx) {
        return ctx.data.a - ctx.data.b;
      },
    },
    multiply: {
      params: {
        a: { type: "number" },
        b: { type: "number" },
      },
      handler(ctx) {
        return ctx.data.a * ctx.data.b;
      },
    },
    divide: {
      params: {
        a: { type: "number" },
        b: { type: "number" },
      },
      handler(ctx) {
        if (ctx.data.b === 0) {
          throw new Error("Division by zero");
        }
        return ctx.data.a / ctx.data.b;
      },
    },
  },
});

// Users Service
broker.createService({
  name: "users",
  actions: {
    list: {
      handler() {
        return [
          { id: 1, name: "Alice", email: "alice@example.com" },
          { id: 2, name: "Bob", email: "bob@example.com" },
          { id: 3, name: "Charlie", email: "charlie@example.com" },
        ];
      },
    },
    get: {
      params: {
        id: { type: "number" },
      },
      handler(ctx) {
        const users = [
          { id: 1, name: "Alice", email: "alice@example.com" },
          { id: 2, name: "Bob", email: "bob@example.com" },
          { id: 3, name: "Charlie", email: "charlie@example.com" },
        ];
        const user = users.find((u) => u.id === ctx.data.id);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      },
    },
    create: {
      params: {
        name: { type: "string" },
        email: { type: "string" },
      },
      async handler(ctx) {
        const newUser = {
          id: Date.now(),
          name: ctx.data.name,
          email: ctx.data.email,
        };
        // Emit event
        ctx.emit("user.created", newUser);
        return newUser;
      },
    },
  },
  events: {
    "user.created": {
      handler(ctx) {
        broker.log.info(`User created: ${ctx.data.name}`);
      },
    },
  },
});

// Greeter Service
broker.createService({
  name: "greeter",
  actions: {
    hello: {
      params: {
        name: { type: "string", optional: true },
      },
      handler(ctx) {
        const name = ctx.data.name || "World";
        return `Hello, ${name}!`;
      },
    },
    goodbye: {
      params: {
        name: { type: "string" },
      },
      handler(ctx) {
        return `Goodbye, ${ctx.data.name}! See you soon.`;
      },
    },
  },
});

// Slow Service (for testing loading states)
broker.createService({
  name: "slow",
  actions: {
    wait: {
      params: {
        ms: { type: "number", optional: true },
      },
      async handler(ctx) {
        const ms = ctx.data.ms || 2000;
        await new Promise((resolve) => setTimeout(resolve, ms));
        return { waited: ms, message: "Done waiting!" };
      },
    },
  },
});

await broker.start();

// Start Explorer
const explorer = startExplorer(broker, {
  port: 3000,
  host: "0.0.0.0",
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Weave Explorer Test                       ║
╠══════════════════════════════════════════════════════════════╣
║  Explorer UI:  http://localhost:3000                         ║
║                                                              ║
║  Test Actions:                                               ║
║    math.add {"a": 5, "b": 3}                                 ║
║    math.multiply {"a": 4, "b": 7}                            ║
║    users.list {}                                             ║
║    users.get {"id": 1}                                       ║
║    users.create {"name": "Dave", "email": "dave@test.com"}   ║
║    greeter.hello {"name": "Explorer"}                        ║
║    slow.wait {"ms": 3000}                                    ║
║    $node.health {}                                           ║
║                                                              ║
║  Start another node:  npm run start:node2                    ║
║                                                              ║
║  Press Ctrl+C to stop                                        ║
╚══════════════════════════════════════════════════════════════╝
`);
