/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const makeMessage = (MessageTypes) =>
  (type, targetNodeId, payload) => {
    return {
      type: type || MessageTypes.MESSAGE_UNKNOWN,
      targetNodeId,
      payload: Buffer.from(JSON.stringify(payload || {}))
    }
  }

module.exports = makeMessage
