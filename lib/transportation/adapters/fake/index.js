const TransportBase = require('../transport-base')

const MessageTypes = require('../../message-types')
const EventEmitter = require('eventemitter2').EventEmitter2

// create a global eventpass to pass messages between weave brokers.
global.bus = new EventEmitter({
    wildcard: true,
    maxListeners: 100
})

const FakeTransporter = (options) => {
    const self = TransportBase(options)

    self.bus = global.bus
    self.state = 'ready'

    self.connect = (isTryReconnect = false) => {
        self.emit('adapter.connected', false)
        makeSubscribtions()
        return Promise.resolve()
    }

    self.close = () => {
        return Promise.resolve()
    }

    self.send = (message) => {
        const data = self.serialize(message)
        const topic = self.getTopic(message.type, message.targetNodeId)
        self.bus.emit(topic, data)
        return Promise.resolve()
    }

    return self

    function makeSubscribtions () {
        subscribe(MessageTypes.MESSAGE_DISCOVERY)
        subscribe(MessageTypes.MESSAGE_DISCOVERY, self.nodeId)
        subscribe(MessageTypes.MESSAGE_INFO)
        subscribe(MessageTypes.MESSAGE_INFO, self.nodeId)
        subscribe(MessageTypes.MESSAGE_REQUEST, self.nodeId)
        subscribe(MessageTypes.MESSAGE_RESPONSE, self.nodeId)
        subscribe(MessageTypes.MESSAGE_DISCONNECT)
        subscribe(MessageTypes.MESSAGE_HEARTBEAT)
        subscribe(MessageTypes.MESSAGE_EVENT, self.nodeId)
    }

    function subscribe (type, nodeId) {
        const topic = self.getTopic(type, nodeId)
        self.bus.on(topic, message => self.incommingMessage(type, message))
    }
}

module.exports = FakeTransporter
