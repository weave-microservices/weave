/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const makeMessage = (MessageTypes) =>
  (type, targetNodeId, payload) => {
    return {
      type: type || MessageTypes.MESSAGE_UNKNOWN,
      targetNodeId,
      payload: payload || {}
    }
  }

module.exports = makeMessage
