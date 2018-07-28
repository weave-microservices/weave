/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const MessageTypes = require('./message-types')
const makeMessage = require('./message')
const makeConnect = require('./connect')
const makeDisconnect = require('./disconnect')
const makeGetNodeInfos = require('./get-node-infos')
const makeMessageHandlers = require('./message-handlers')
const makeSendNodeInfo = require('./send-node-info')
const makeRequest = require('./request')
const makeResponse = require('./response')
const makeRemovePendingRequests = require('./remove-pending-requests')
const makeEmit = require('./emit')
const makeSendBroadcastEvent = require('./broadcast.factory')
const makeDiscoverNodes = require('./discover-nodes.factory')

const makeSend = ({ adapter, stats }) =>
    (packet) => {
        stats.packets.sent = stats.packets.sent + 1
        return adapter.preSend(packet)
    }

module.exports = require('./transportation')({
    makeConnect,
    makeDisconnect,
    MessageTypes,
    Message: makeMessage(MessageTypes),
    makeGetNodeInfos,
    makeRemovePendingRequests,
    makeMessageHandlers,
    makeSend,
    makeSendNodeInfo,
    makeRequest,
    makeResponse,
    makeEmit,
    makeSendBroadcastEvent,
    makeDiscoverNodes,
    makeLocalRequestProxy: require('./local-request-proxy.factory')
})
