/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

import { BaseTransportAdapter } from "../adapterBase.mts";
import pkg from "eventemitter2";
const { EventEmitter2 } = pkg;

// Create a global eventbus to pass messages between weave service brokers.
// @ts-expect-error - the dummy adapter shares one bus across brokers in a process
if (!global.bus) {
  // @ts-expect-error - see above
  global.bus = new EventEmitter2({
    wildcard: true,
    maxListeners: 100,
  });
}

/**
 * Dummy transport adapter for in-process communication
 * Uses a global event bus to pass messages between brokers
 */
class DummyTransportAdapter extends BaseTransportAdapter {
  // @ts-expect-error - see the global bus above
  #messageBus = global.bus;

  constructor() {
    super();
    this.name = "Dummy";
  }

  async connect(): Promise<void> {
    this.bus.emit("$adapter.connected", false);
    this.log.debug("Dummy transport client connected.");
  }

  async close(): Promise<void> {
    // Nothing to clean up
  }

  async send(message: any): Promise<void> {
    const data = this.serialize(message);
    const topic = this.getTopic(message.type, message.targetNodeId);
    this.#messageBus.emit(topic, data);
  }

  subscribe(type: string, nodeId?: string): Promise<void> {
    const topic = this.getTopic(type, nodeId);
    this.#messageBus.on(topic, (message: any) => this.incomingMessage(type, message));
    return Promise.resolve();
  }
}

/**
 * Factory function for creating Dummy adapter instances
 * Maintains backward compatibility with existing code
 */
export default function createDummyAdapter(_adapterOptions: any = {}): DummyTransportAdapter {
  return new DummyTransportAdapter();
}
