/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const MessageTypes = require('./message-types')
const makeMessage = require('./message')

const deps = {
    makeConnect: require('./connect'),
    makeDisconnect: require('./disconnect'),
    makeDiscoverNodes: require('./discover-nodes.factory'),
    makeEmit: require('./emit'),
    makeGetNodeInfos: require('./get-node-infos'),
    makeLocalRequestProxy: require('./local-request-proxy.factory'),
    makeMessageHandlers: require('./message-handlers'),
    makeRemovePendingRequests: require('./remove-pending-requests'),
    makeRequest: require('./request'),
    makeResponse: require('./response'),
    makeSend: require('./send.factory'),
    makeSendBroadcastEvent: require('./broadcast.factory'),
    makeSendNodeInfo: require('./send-node-info'),
    makeSetReady: require('./set-ready.factory'),
    Message: makeMessage(MessageTypes),
    MessageTypes,
    utils: require('../utils')
}

module.exports = require('./transport.factory')(deps)
