import * as MessageTypes from './messageTypes.mts';

/**
 * Create a message object
 *
 * @param {string} type - The message type
 * @param {string} targetNodeId - The target node id
 * @param {object} payload - The message payload
 * @returns {object} - The message object
*/
export const createMessage = (type: string, targetNodeId: string, payload: object) => {
  return {
    type: type || MessageTypes.MESSAGE_UNKNOWN,
    targetNodeId,
    payload: payload || {}
  };
};

