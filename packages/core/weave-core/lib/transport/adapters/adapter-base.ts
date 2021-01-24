/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { Broker } from "../../broker/broker"
import { Logger } from "../../logger"
import { EventEmitter } from "events"
import { MessageHandlerResult } from "../message-handlers"
import { Transport, TransportMessage } from "../transport-factory"

export type ConnectionEventParams = {}
export type ErrorHandlerDelegate = (error) => void

export type TransportAdapterConnectionFeatures = {
  wasReconnect: boolean,
  useHeartbeatTimer: boolean,
  useRemoteNodeCheckTimer: boolean,
  useOfflineCheckTimer: true
}

export interface TransportAdapter {
  name: string,
  broker: Broker,
  transport: Transport,
  messageHandler: MessageHandlerResult,
  log: Logger,
  bus: EventEmitter,
  afterInit: Function,
  isConnected: boolean,
  interruptCounter: number,
  repeatAttemptCounter: number,
  init(broker: Broker, transport: Transport, messageHandler: MessageHandlerResult),
  connect(isReconnected: boolean, handleError: ErrorHandlerDelegate): Promise<void>,
  subscribe(type: string, nodeId?: string): Promise<any>,
  connected(features: TransportAdapterConnectionFeatures): void,
  disconnected(): void,
  close(): Promise<any>,
  getTopic(cmd: string, nodeId: string): string,
  preSend (message: TransportMessage): Promise<any>,
  send(message: TransportMessage): Promise<any>,
  incommingMessage(messageType: string, buffer: Buffer): void,
  serialize(message: TransportMessage): Buffer,
  deserialize(packet: string): any,
  updateStatisticSent(length: number): void,
  updateStatisticReceived(length: number): void,
}

export default function TransportAdapterBase(): TransportAdapter{
  let prefix = 'weave'
  let broker: Broker
  let transport: Transport
  let messageHandler: MessageHandlerResult
  let log: Logger
  
  const baseTransportAdapter: TransportAdapter = {
    name: null,
    broker,
    transport,
    messageHandler,
    log,
    bus: new EventEmitter(),
    afterInit: null,
    isConnected: false,
    interruptCounter: 0,
    repeatAttemptCounter: 0,
    init (b: Broker, t: Transport, m: MessageHandlerResult) {
      broker = b
      transport = t
      log = transport.log
      messageHandler = m

      if (broker.options.namespace) {
        prefix = `${prefix}-${broker.options.namespace}`
      }

      if (this.afterInit) {
        this.afterInit()
      }

      return Promise.resolve()
    },
    subscribe(type: string, nodeId?: string) {
      return Promise.resolve()
    },
    connect() {
      return Promise.resolve()
    },
    close() {
      return Promise.resolve()
    },
    /**
     *
     * Connection handler
     * @instance
     * @param {*} connectionEventParams Connection event
     * @param {boolean} [startHeartbeatTimers=true] Start timers for this adapter
     * @returns {void}
    */
    connected (features: TransportAdapterConnectionFeatures) {
      this.bus.emit('$adapter.connected', features)
    },
    disconnected () {
      this.bus.emit('$adapter.disconnected')
    },
    getTopic (cmd: string, nodeId: string) {
      return prefix + '.' + cmd + (nodeId ? '.' + nodeId : '')
    },
    preSend (message: TransportMessage) {
      return this.send(message)
    },
    send (message: TransportMessage) {
      return this.broker.handleError(new Error('Method "send" not implemented.'))
    },
    incommingMessage (messageType: string, message: Buffer) {
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
    deserialize(packet: string) {
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

  return baseTransportAdapter
}
