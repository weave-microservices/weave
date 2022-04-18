import { ActionHandler } from "./ActionHandler";
import { ActionSchema } from "./ActionSchema";
import { EventHandler } from "./EventHandler";
import { EventSchema } from "./EventSchema";
import { Service } from "./Service";
import { ServiceSettings } from "./ServiceSettings";

export type ServiceSchema = {
  name: string;
  version?: number;
  mixins?: string[];
  dependencies: string[];
  meta: any;
  settings?: ServiceSettings,
  actions?: {
    [actionName: string]: ActionSchema | ActionHandler | boolean;
  },
  events?: {
    [eventName: string]: EventSchema | EventHandler;
  },
  methods?: {
    [methodName: string]: (...args: any[]) => any;
  },
  afterSchemasMerged?: (schemas: ServiceSchema) => void;
  created?: (service: Service) => void;
  started?: (service: Service) => Promise<void>;
  stopped?: (service: Service) => Promise<void>;
  // destroyed?: (service: Service) => void;
};
