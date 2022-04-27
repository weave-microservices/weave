import { ContextMetadata } from "../broker/ContextMetadata";
import { Payload } from "./Payload";

export type RequestPayload = {
  id: string;
  parentId: string;
  requestId: string;
  data: unknown;
  meta?: ContextMetadata;
  level: number;
  metrics?: any;
  timeout?: number;
  action: string; // todo: rename to actionName
  isStream: boolean
} & Payload