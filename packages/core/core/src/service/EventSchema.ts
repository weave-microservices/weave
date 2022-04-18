import { EventHandler } from "./EventHandler";

export type EventSchema = {
  params?: any;
  cache?: {
    keys: string[];
    ttl?: number;
  },
  handler: EventHandler;
}
