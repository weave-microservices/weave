import type { ErrorPayload, Runtime } from '../../types/index.js';
import { WeaveError } from '../errors.mts';

export const errorPayloadFactory = (runtime: Runtime) => (error: WeaveError): ErrorPayload => {
  return {
    name: error.name,
    message: error.message,
    nodeId: error.nodeId || runtime.nodeId,
    code: error.code,
    stack: error.stack,
    data: error.data,
  };
};
