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

const makeRemoteRequestHandler = ({ localCall, log, registry, Errors }) =>
    context => {
        const actionName = context.action.name
        const endpointList = registry.getActionEndpoints(actionName)

        if (endpointList == null || !endpointList.hasLocal()) {
            log.warn(`Service ${actionName} not found localy.`)
            return Promise.reject('Service not found')
        }

        const endpoint = endpointList.getNextLocalEndpoint()
        if (!endpoint) {
            log.warn(`Service ${actionName} is not available localy.`)
            return Promise.reject('Service not found')
        }
        const options = {}

        return localCall(context, endpoint, options)
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
    makeRemoteRequestHandler
})
