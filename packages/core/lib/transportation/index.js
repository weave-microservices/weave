/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const MessageTypes = require('./message-types')
const makeMessage = require('./message')

module.exports = require('./transportation')({
    makeConnect: require('./connect'),
    makeDisconnect: require('./disconnect'),
    MessageTypes: require('./message-types'),
    Message: makeMessage(MessageTypes),
    makeGetNodeInfos: require('./get-node-infos'),
    makeRemovePendingRequests: require('./remove-pending-requests'),
    makeMessageHandlers: require('./message-handlers'),
    makeSend: require('./send.factory'),
    makeSendNodeInfo: require('./send-node-info'),
    makeRequest: require('./request'),
    makeResponse: require('./response'),
    makeEmit: require('./emit'),
    makeSendBroadcastEvent: require('./broadcast.factory'),
    makeDiscoverNodes: require('./discover-nodes.factory'),
    makeLocalRequestProxy: require('./local-request-proxy.factory'),
    makeSetReady: require('./set-ready.factory')
})
