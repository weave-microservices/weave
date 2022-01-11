const MessageTypes = require('./messageTypes')

const createMessage = (type, targetNodeId, payload) => {
  return {
    type: type || MessageTypes.MESSAGE_UNKNOWN,
    targetNodeId,
    payload: payload || {}
  }
}

module.exports = { createMessage }
