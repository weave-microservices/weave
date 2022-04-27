import { ContextMetadata } from "../broker/ContextMetadata";
import { Payload } from "./Payload";

export type EventPayload = {
  id: string;
  parentId: string;
  requestId: string;
  data: unknown;
  meta?: ContextMetadata;
  level: number;
  metrics?: any;
  timeout?: number;
  eventName: string;
  isBroadcast: boolean
} & Payload