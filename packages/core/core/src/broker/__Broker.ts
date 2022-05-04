import { Runtime } from "../runtime/Runtime";
import { Service } from "../service/Service";
import { ServiceSchema } from "../service/ServiceSchema";

export interface Broker {
  nodeId: string;
  runtime: Runtime;
  getUUID: () => string;
  createService: (serviceSchema: ServiceSchema) => Service
  loadServiceFromFile: (filename: string) => Service;
  loadService: (filename: string) => Service;
  loadServices: (folder: string, fileMast: string) => Service[];
  start: () => Promise<void>;
  stop: () => Promise<void>;
  ping: (nodeId?: string, timeout?: number) => Promise<any>;
  waitForServices: (serviceNames: string[], timeout?: number, interval?: number) => Promise<void>;
}
