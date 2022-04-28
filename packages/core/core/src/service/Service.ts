import { ActionHandler } from "./ActionHandler";
import { ActionSchema } from "./ActionSchema";
import { ServiceSchema } from "./ServiceSchema";
import { ServiceSettings } from "./ServiceSettings";

type ServiceMethods = {
  [key: string]: (...args: any[]) => any;
}

export type Service = {
  name: string;
  version?: number;
  mixins?: string[];
  fullyQualifiedName: string;
  meta: any;
  settings: ServiceSettings,
  schema: ServiceSchema,
  actions: {
    [actionName: string]: (...args: any[]) => any;
  },
  events: {
    [eventName: string]: (...args: any[]) => any;
  },
  start (): Promise<void>;
  stop (): Promise<void>;
  log: any;
  [key: string]: any;
};
