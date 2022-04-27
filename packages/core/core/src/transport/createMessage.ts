import { TransportMessage } from "./TransportMessage";
import * as MessageTypes from './messageTypes';

const createMessage = function<PayloadType> (
  type: string,
  targetNodeId?: string,
  payload?: PayloadType
): TransportMessage {
  return {
    type: type || MessageTypes.MESSAGE_UNKNOWN,
    targetNodeId,
    payload: payload || {}
  };
};

export { createMessage };
