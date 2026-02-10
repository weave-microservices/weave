/**
 * Second Node for Explorer Test
 *
 * Start with: npm run start:node2
 * This node will join the cluster and appear in the Explorer graph.
 */

import { createBroker, TransportAdapters } from "@weave-js/core";

const broker = createBroker({
  nodeId: "explorer-node2",
  transport: {
    adapter: TransportAdapters.TCP(),
  },
  logger: {
    level: "info",
  },
});

// Products Service (only on this node)
broker.createService({
  name: "products",
  actions: {
    list: {
      handler() {
        return [
          { id: 1, name: "Laptop", price: 999 },
          { id: 2, name: "Mouse", price: 29 },
          { id: 3, name: "Keyboard", price: 79 },
          { id: 4, name: "Monitor", price: 349 },
        ];
      },
    },
    get: {
      params: {
        id: { type: "number" },
      },
      handler(ctx) {
        const products = [
          { id: 1, name: "Laptop", price: 999 },
          { id: 2, name: "Mouse", price: 29 },
          { id: 3, name: "Keyboard", price: 79 },
          { id: 4, name: "Monitor", price: 349 },
        ];
        const product = products.find((p) => p.id === ctx.data.id);
        if (!product) {
          throw new Error("Product not found");
        }
        return product;
      },
    },
    search: {
      params: {
        query: { type: "string" },
      },
      handler(ctx) {
        const products = [
          { id: 1, name: "Laptop", price: 999 },
          { id: 2, name: "Mouse", price: 29 },
          { id: 3, name: "Keyboard", price: 79 },
          { id: 4, name: "Monitor", price: 349 },
        ];
        const query = ctx.data.query.toLowerCase();
        return products.filter((p) => p.name.toLowerCase().includes(query));
      },
    },
  },
  events: {
    "order.created": {
      handler(ctx) {
        broker.log.info(`Order received: ${JSON.stringify(ctx.data)}`);
      },
    },
  },
});

// Orders Service (only on this node)
broker.createService({
  name: "orders",
  actions: {
    create: {
      params: {
        productId: { type: "number" },
        quantity: { type: "number" },
      },
      async handler(ctx) {
        const order = {
          id: Date.now(),
          productId: ctx.data.productId,
          quantity: ctx.data.quantity,
          status: "pending",
          createdAt: new Date().toISOString(),
        };
        ctx.emit("order.created", order);
        return order;
      },
    },
    list: {
      handler() {
        return [
          { id: 1, productId: 1, quantity: 2, status: "shipped" },
          { id: 2, productId: 3, quantity: 1, status: "pending" },
        ];
      },
    },
  },
});

await broker.start();

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    Weave Explorer - Node 2                   ║
╠══════════════════════════════════════════════════════════════╣
║  This node provides:                                         ║
║    - products.list, products.get, products.search            ║
║    - orders.create, orders.list                              ║
║                                                              ║
║  Check the Explorer UI to see this node in the graph!        ║
║                                                              ║
║  Press Ctrl+C to stop                                        ║
╚══════════════════════════════════════════════════════════════╝
`);
