/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const EventEmitterMixin = require('../../utils/event-emitter-mixin')

function TransportBase () {
    const self = Object.assign({}, EventEmitterMixin())
    let prefix = 'WEAVE'

    self.connected = false
    self.interruptionCount = 0
    self.reattemptCount = 0
    self.name = 'Unknown'

    self.init = ({ state, log, nodeId, messageHandler, afterConnectHandler, registry, Message, MessageTypes }) => {
        self.log = log
        self.registry = registry
        self.nodeId = nodeId
        self.messageHandler = messageHandler
        self.afterConnect = afterConnectHandler
        self.Message = Message
        self.MessageTypes = MessageTypes

        if (state.namespace) {
            prefix += `-${state.namespace}`
        }

        if (self.onInit) {
            self.onInit({ state, log, nodeId, messageHandler, afterConnectHandler, registry, Message, MessageTypes })
        }

        return Promise.resolve()
    }

    self.getNodeInfos = () => {
        return {
            services: self.weave.serviceRegistry.getServiceList({ localOnly: true, withActions: true, withInternalActions: true }),
            nodeId: self.nodeId,
            versions: {
                node: process.version,
                weave: self.weave.version
            }
        }
    }

    self.incommingMessage = (messageType, message) => {
        const data = self.deserialize(message)
        self.messageHandler(messageType, data)
    }

    self.preSend = (packet) => {
        return self.send(packet)
    }

    self.onConnected = (wasReconnect) => {
        this.connected = true
        if (self.afterConnect) {
            return self.afterConnect(wasReconnect)
        }
        return Promise.resolve()
    }

    self.getTopic = (cmd, nodeId) => prefix + '.' + cmd + (nodeId ? '.' + nodeId : '')

    self.serialize = (packet) => {
        try {
            packet.payload.sender = self.nodeId
            return Buffer.from(JSON.stringify(packet))
        } catch (error) {
            throw Error(error)
        }
    }

    self.deserialize = (packet) => {
        try {
            return JSON.parse(packet)
        } catch (error) {
            throw Error(error)
        }
    }

    self.subscribe = (type, nodeId) => {
        throw new Error('Not implemented.')
    }

    return self
}
module.exports = TransportBase
