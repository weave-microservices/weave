/**
 * Explorer Test Broker with Redis Transport
 *
 * Requirements: Redis server running on localhost:6379
 *
 * Start with: npm run start:redis
 * Then open: http://localhost:3000
 */

import { createBroker } from "@weave-js/core";
import { startExplorer } from "@weave-js/explorer";
import RedisTransport from "@weave-js/redis-transport";

const broker = createBroker({
  nodeId: "explorer-redis-main",
  transport: {
    adapter: RedisTransport({
      host: "127.0.0.1",
      port: 6379,
    }),
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
    multiply: {
      params: {
        a: { type: "number" },
        b: { type: "number" },
      },
      handler(ctx) {
        return ctx.data.a * ctx.data.b;
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
        ];
        return users.find((u) => u.id === ctx.data.id) || null;
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
        return `Hello, ${ctx.data.name || "World"}!`;
      },
    },
  },
});

await broker.start();

// Start Explorer
startExplorer(broker, {
  port: 3000,
  host: "0.0.0.0",
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║              Weave Explorer Test (Redis Transport)           ║
╠══════════════════════════════════════════════════════════════╣
║  Explorer UI:  http://localhost:3000                         ║
║  Transport:    Redis (localhost:6379)                        ║
║                                                              ║
║  Test Actions:                                               ║
║    math.add {"a": 5, "b": 3}                                 ║
║    users.list {}                                             ║
║    greeter.hello {"name": "Redis"}                           ║
║                                                              ║
║  Start another node:  npm run start:redis-node2              ║
║                                                              ║
║  Press Ctrl+C to stop                                        ║
╚══════════════════════════════════════════════════════════════╝
`);
