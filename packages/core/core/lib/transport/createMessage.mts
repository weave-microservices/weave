import * as MessageTypes from "./messageTypes.mts";
import type { TransportMessage, TransportMessagePayload } from "../../types/index.js";

/**
 * Create a message object
 *
 * @param type - The message type
 * @param targetNodeId - The target node id
 * @param payload - The message payload
 * @returns The message object
 */
export const createMessage = <T extends TransportMessagePayload = TransportMessagePayload>(
  type: string,
  targetNodeId?: string,
  payload?: T,
): TransportMessage<T> => {
  return {
    type: type || MessageTypes.MESSAGE_UNKNOWN,
    targetNodeId,
    payload: (payload || {}) as T,
  };
};
