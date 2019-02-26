/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const EventEmitter = require('events').EventEmitter

function TransportBase () {
    let prefix = 'WEAVE'
    const self = {}
    self.interruptionCount = 0
    self.reattemptCount = 0
    self.name = 'Unknown'

    return {
        bus: new EventEmitter(),
        name: null,
        isConnected: false,
        init (broker, transport, messageHandler) {
            this.broker = broker
            this.transport = transport
            this.log = transport.log
            this.messageHandler = messageHandler

            if (broker.options.namespace) {
                prefix += `-${broker.options.namespace}`
            }
            // return this.adapterInit()
            return Promise.resolve()
        },
        connected (wasReconnect, startHeartbeatTimers = true) {
            this.bus.emit('$adapter.connected', wasReconnect, startHeartbeatTimers)
        },
        getNodeInfos () {
            return {
                services: self.weave.serviceRegistry.getServiceList({ localOnly: true, withActions: true, withInternalActions: true }),
                nodeId: self.nodeId,
                versions: {
                    node: process.version,
                    weave: self.weave.version
                }
            }
        },
        getTopic (cmd, nodeId) {
            return prefix + '.' + cmd + (nodeId ? '.' + nodeId : '')
        },
        preSend (packet) {
            return this.send(packet)
        },
        send (message) {
            throw new Error('Method "send" not implemented.')
        },
        incommingMessage (messageType, message) {
            const data = this.deserialize(message)
            this.bus.emit('$adapter.message', messageType, data)
            // this.messageHandler(messageType, data)
        },
        serialize (packet) {
            try {
                packet.payload.sender = self.nodeId
                return Buffer.from(JSON.stringify(packet))
            } catch (error) {
                throw Error(error)
            }
        },
        deserialize (packet) {
            try {
                return JSON.parse(packet)
            } catch (error) {
                throw Error(error)
            }
        }
    }

    self.init = (broker, transport) => {
        self.log = transport.log
        self.registry = broker.registry
        self.nodeId = broker.nodeId
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

