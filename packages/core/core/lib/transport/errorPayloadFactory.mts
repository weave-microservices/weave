import type { Runtime } from "../../types/index.js";
import { WeaveError } from "../errors.mts";

/**
 * Error with optional nodeId property (can be set during restoration)
 */
interface TransportError extends WeaveError {
  nodeId?: string;
}

/**
 * Error payload for transport layer serialization
 */
export interface TransportErrorPayload {
  name: string;
  message: string;
  nodeId: string;
  code: string;
  stack?: string;
  data: unknown;
}

export const errorPayloadFactory =
  (runtime: Runtime) =>
  (error: TransportError): TransportErrorPayload => {
    return {
      name: error.name,
      message: error.message,
      nodeId: error.nodeId || runtime.nodeId,
      code: error.code,
      stack: error.stack,
      data: error.data,
    };
  };
