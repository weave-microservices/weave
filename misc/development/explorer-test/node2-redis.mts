/**
 * Second Node for Explorer Test (Redis Transport)
 *
 * Requirements: Redis server running on localhost:6379
 *
 * Start with: npm run start:redis-node2
 */

import { createBroker } from "@weave-js/core";
import RedisTransport from "@weave-js/redis-transport";
import { startExplorer } from '../../../packages/core/explorer/lib/server/index.mts';
import { createPacketTrackerMiddleware } from '../../../packages/core/explorer/lib/server/packetTracker.mts';
  const packetTracker = createPacketTrackerMiddleware();                                                                                                                                                                                                                                                                     

const broker = createBroker({
  nodeId: "explorer-redis-node2",
  middlewares: [packetTracker],                                                                                                                                                                                                                                                                                             

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

                                                                                                                                                                                                                                                                                                                             
  // 2. Broker mit Middleware erstellen                                                                                                                                                                                                                                                                                      
 
await broker.start();


const explorer = startExplorer(broker, {
  port: 3000,
  host: "0.0.0.0",
});

console.log(`
╔══════════════════════════════════════════════════════════════╗
║           Weave Explorer - Node 2 (Redis Transport)          ║
╠══════════════════════════════════════════════════════════════╣
║  Transport:  Redis (localhost:6379)                          ║
║                                                              ║
║  Services:                                                   ║
║    - products.list, products.get                             ║
║    - orders.create                                           ║
║                                                              ║
║  Check the Explorer UI to see this node!                     ║
║                                                              ║
║  Press Ctrl+C to stop                                        ║
╚══════════════════════════════════════════════════════════════╝
`);
