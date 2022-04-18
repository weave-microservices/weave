import { ActionHandler } from "./ActionHandler";

export type ActionSchema = {
  params?: any;
  cache?: {
    keys: string[];
    ttl?: number;
  },
  handler: ActionHandler;
}
