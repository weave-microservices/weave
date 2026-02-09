/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { EventEmitter } from "events";
import type { Broker, Transport, Logger } from "../../../types/index.js";

/**
 * Abstract base class for transport adapters
 * Provides common functionality for all transport implementations
 */
export abstract class BaseTransportAdapter {
  name: string = "";
  bus: EventEmitter = new EventEmitter();
  isConnected: boolean = false;
  interruptionCount: number = 0;
  repeatAttemptCounter: number = 0;

  // Protected properties - set during init
  protected broker!: Broker;
  protected transport!: Transport;
  protected log!: Logger;
  protected messageHandler!: any;
  protected prefix: string = "weave";

  /**
   * Initialize the adapter with broker and transport instances
   */
  async init(broker: Broker, transport: Transport, messageHandler: any): Promise<void> {
    this.broker = broker;
    this.transport = transport;
    this.log = transport.log;
    this.messageHandler = messageHandler;

    if (broker.options.namespace) {
      this.prefix = `${this.prefix}-${broker.options.namespace}`;
    }

    await this.afterInit();
  }

  /**
   * Hook called after initialization
   * Override in subclasses for custom initialization logic
   */
  protected async afterInit(): Promise<void> {
    // Override in subclasses if needed
  }

  /**
   * Connect to the transport
   * Must be implemented by subclasses
   */
  abstract connect(): Promise<void>;

  /**
   * Subscribe to a topic
   * Override in subclasses if needed
   */
  subscribe(type: string, nodeId?: string): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Send a message
   * Must be implemented by subclasses
   */
  abstract send(message: any): Promise<void>;

  /**
   * Close the adapter connection
   * Must be implemented by subclasses
   */
  abstract close(): Promise<void>;

  /**
   * Connection handler - emits connected event
   */
  protected connected(connectionEventParams: any = {}): void {
    this.bus.emit("$adapter.connected", connectionEventParams);
  }

  /**
   * Disconnection handler - emits disconnected event
   */
  protected disconnected(): void {
    this.bus.emit("$adapter.disconnected");
  }

  /**
   * Get topic name for a command and optional node ID
   */
  protected getTopic(cmd: string, nodeId?: string): string {
    return this.prefix + "." + cmd + (nodeId ? "." + nodeId : "");
  }

  /**
   * Pre-send hook
   */
  preSend(packet: any): Promise<void> {
    return this.send(packet);
  }

  /**
   * Handle incoming message
   */
  protected incomingMessage(messageType: string, message: string | Buffer): void {
    const data = this.deserialize(message);
    this.updateStatisticReceived(message.length);
    this.bus.emit("$adapter.message", messageType, data);
  }

  /**
   * Serialize a packet to Buffer
   */
  protected serialize(packet: any): Buffer {
    try {
      packet.payload.sender = this.broker.nodeId;
      return Buffer.from(JSON.stringify(packet));
    } catch (error) {
      this.broker.handleError(error);
      return Buffer.from("");
    }
  }

  /**
   * Deserialize a packet from Buffer or string
   */
  protected deserialize(packet: string | Buffer): any {
    try {
      return JSON.parse(packet.toString());
    } catch (error) {
      this.broker.handleError(error);
      return null;
    }
  }

  /**
   * Update received statistics
   */
  protected updateStatisticReceived(length: number): void {
    this.transport.statistics.received.packages += length;
  }

  /**
   * Update sent statistics
   */
  protected updateStatisticSent(length: number): void {
    this.transport.statistics.sent.packages += length;
  }
}

/**
 * Legacy factory function for backward compatibility
 * @deprecated Use BaseTransportAdapter class directly
 */
const createTransportBase = (options = {}): any => {
  // This is kept for backward compatibility but should not be used
  // All new adapters should extend BaseTransportAdapter class
  throw new Error("createTransportBase is deprecated. Extend BaseTransportAdapter class instead.");
};

export default createTransportBase;
