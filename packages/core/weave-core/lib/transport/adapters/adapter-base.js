/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const EventEmitter = require('events').EventEmitter

const createTransportBase = () => {
  let prefix = 'weave'

  return {
    name: null,
    bus: new EventEmitter(),
    afterInit: null,
    isConnected: false,
    interruptCounter: 0,
    repeatAttemptCounter: 0,
    init (broker, transport, messageHandler) {
      this.broker = broker
      this.transport = transport
      this.log = transport.log
      this.messageHandler = messageHandler

      if (broker.options.namespace) {
        prefix = `${prefix}-${broker.options.namespace}`
      }

      if (this.afterInit) {
        this.afterInit()
      }

      return Promise.resolve()
    },
    subscribe () {
      return Promise.resolve()
    },
    /**
     *
     * Connection handler
     * @instance
     * @param {*} wasReconnect Was it a reconnection atemp?
     * @param {boolean} [startHeartbeatTimers=true] Start timers for this adapter
     * @returns {void}
    */
    connected (wasReconnect, startHeartbeatTimers = true) {
      this.bus.emit('$adapter.connected', wasReconnect, startHeartbeatTimers)
    },
    disconnected () {
      this.bus.emit('$adapter.disconnected')
    },
    getTopic (cmd, nodeId) {
      const topic = prefix + '.' + cmd + (nodeId ? '.' + nodeId : '')
      return topic
    },
    preSend (packet) {
      return this.send(packet)
    },
    send (/* message*/) {
      this.broker.handleError(new Error('Method "send" not implemented.'))
    },
    incommingMessage (messageType, message) {
      const data = this.deserialize(message)
      this.updateStatisticReceived(message.length)
      this.bus.emit('$adapter.message', messageType, data)
    },
    serialize (packet) {
      try {
        // Add the sender to each outgoing message
        packet.payload.sender = this.broker.nodeId
        return Buffer.from(JSON.stringify(packet))
      } catch (error) {
        this.broker.handleError(error)
      }
    },
    deserialize (packet) {
      try {
        return JSON.parse(packet)
      } catch (error) {
        this.broker.handleError(error)
      }
    },
    updateStatisticReceived (length) {
      this.transport.statistics.received.packages += length
    },
    updateStatisticSent (length) {
      this.transport.statistics.sent.packages += length
    }
  }
}

module.exports = createTransportBase
