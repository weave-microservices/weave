const MessageTypes = require('./messageTypes');

/**
 * Create a message object
 *
 * @param {string} type - The message type
 * @param {string} targetNodeId - The target node id
 * @param {object} payload - The message payload
 * @returns {object} - The message object
*/
const createMessage = (type, targetNodeId, payload) => {
  return {
    type: type || MessageTypes.MESSAGE_UNKNOWN,
    targetNodeId,
    payload: payload || {}
  };
};

module.exports = { createMessage };
