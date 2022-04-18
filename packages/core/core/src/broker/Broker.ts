import { Runtime } from "../runtime/Runtime";

export type Broker = {
  nodeId: string;
  runtime: Runtime;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  waitForServices: (serviceNames: string[], timeout?: number, interval?: number) => Promise<void>;
  ping: (nodeId?: string) => Promise<void>;
}
