import { createServer, IncomingMessage, ServerResponse } from "http";
import { readFile } from "fs/promises";
import { extname, join } from "path";
import { fileURLToPath } from "url";
import type { Broker } from "@weave-js/core";
import { generateToken } from "../utils/token.mts";
import { setupWebSocket } from "./websocket.mts";
import type { PacketTrackerMiddleware } from "./packetTracker.mts";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST_DIR = join(__dirname, "../../dist");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

export interface ExplorerOptions {
  port?: number;
  host?: string;
  secure?: boolean;
  token?: string;
  /**
   * Packet tracker middleware for visualizing inter-node communication.
   * Must be registered with the broker BEFORE it starts.
   */
  packetTracker?: PacketTrackerMiddleware;
}

export interface ExplorerInstance {
  server: ReturnType<typeof createServer>;
  wss: ReturnType<typeof setupWebSocket>["wss"];
  token: string | null;
  close: () => Promise<void>;
}

/**
 * Start the Weave Explorer dashboard
 */
export function startExplorer(broker: Broker, options: ExplorerOptions = {}): ExplorerInstance {
  const { port = 3000, host = "0.0.0.0", secure = false, packetTracker } = options;

  // Generate or use provided token
  const token = secure ? options.token || generateToken() : null;
  if (secure && !options.token) {
    broker.log.info(`Explorer Token: ${token}`);
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    // CORS headers for development
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    // Auth check for API routes
    if (token && url.pathname.startsWith("/api/") && !checkAuth(req, url, token)) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }

    // API Routes
    if (url.pathname.startsWith("/api/")) {
      await handleAPI(req, res, url, broker);
      return;
    }

    // Static files
    await serveStatic(res, url);
  });

  // WebSocket Server
  const wsContext = setupWebSocket(server, broker, token);

  // Connect packet tracker to WebSocket broadcast
  if (packetTracker) {
    packetTracker.addListener(wsContext.broadcastPacket);
  }

  server.listen(port, host, () => {
    broker.log.info(`Explorer running at http://${host}:${port}`);
    if (packetTracker) {
      broker.log.info("Packet tracking enabled");
    }
  });

  return {
    server,
    wss: wsContext.wss,
    token,
    close: () =>
      new Promise((resolve) => {
        if (packetTracker) {
          packetTracker.removeListener(wsContext.broadcastPacket);
        }
        wsContext.wss.close(() => {
          server.close(() => resolve());
        });
      }),
  };
}

function checkAuth(req: IncomingMessage, url: URL, token: string): boolean {
  const authHeader = req.headers.authorization;
  const queryToken = url.searchParams.get("token");
  const providedToken = authHeader?.replace("Bearer ", "") || queryToken;
  return providedToken === token;
}

async function serveStatic(res: ServerResponse, url: URL) {
  let filePath = join(DIST_DIR, url.pathname === "/" ? "index.html" : url.pathname);

  try {
    const content = await readFile(filePath);
    const ext = extname(filePath);
    res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream");
    res.end(content);
  } catch {
    // Try index.html for SPA routing
    try {
      const indexContent = await readFile(join(DIST_DIR, "index.html"));
      res.setHeader("Content-Type", "text/html");
      res.end(indexContent);
    } catch {
      res.statusCode = 404;
      res.end("Not Found");
    }
  }
}

async function handleAPI(req: IncomingMessage, res: ServerResponse, url: URL, broker: Broker) {
  res.setHeader("Content-Type", "application/json");

  try {
    switch (url.pathname) {
      case "/api/nodes":
        res.end(
          JSON.stringify(
            broker.runtime.registry.nodeCollection.list().map((node: any) => ({
              id: node.id,
              isLocal: node.isLocal,
              isAvailable: node.isAvailable,
              services: node.services?.map((s: any) => s.name) || [],
              client: node.client,
              cpu: node.cpu,
            })),
          ),
        );
        break;

      case "/api/actions":
        res.end(
          JSON.stringify(
            broker.runtime.registry.actionCollection.list({ withEndpoints: true }).map((item: any) => ({
              name: item.action?.name,
              params: item.action?.params,
              count: item.count,
              hasAvailable: item.hasAvailable,
            })),
          ),
        );
        break;

      case "/api/events":
        res.end(
          JSON.stringify(
            broker.runtime.registry.eventCollection.list().map((item: any) => ({
              name: item.name,
              group: item.groupName,
              count: item.count,
              hasAvailable: item.hasAvailable,
            })),
          ),
        );
        break;

      case "/api/services":
        res.end(
          JSON.stringify(
            broker.runtime.registry.serviceCollection.list({
              withActions: true,
              withEvents: true,
            }),
          ),
        );
        break;

      case "/api/info":
        res.end(
          JSON.stringify({
            nodeId: broker.nodeId,
            version: broker.version,
          }),
        );
        break;

      case "/api/call":
        if (req.method === "POST") {
          const body = await readBody(req);
          const { action, params } = JSON.parse(body);
          const result = await broker.call(action, params);
          res.end(JSON.stringify({ result }));
        } else {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: "Method not allowed" }));
        }
        break;

      default:
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not found" }));
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: (error as Error).message }));
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}
