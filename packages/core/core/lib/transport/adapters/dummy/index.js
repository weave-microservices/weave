/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 */

const TransportBase = require('../adapterBase');
const EventEmitter = require('eventemitter2').EventEmitter2;

// create a global eventbus to pass messages between weave service brokers.
global.bus = new EventEmitter({
  wildcard: true,
  maxListeners: 100
});

const DummyTransportAdapter = (adapterOptions) => {
  const messageBus = global.bus;

  return Object.assign(TransportBase(adapterOptions), {
    name: 'Dummy',
    connect () {
      this.bus.emit('$adapter.connected', false);
      this.log.info('Dummy transport client connected.');
      return Promise.resolve();
    },
    close () {
      return Promise.resolve();
    },
    send (message) {
      const data = this.serialize(message);
      const topic = this.getTopic(message.type, message.targetNodeId);
      messageBus.emit(topic, data);
      return Promise.resolve();
    },
    subscribe (type, nodeId) {
      const topic = this.getTopic(type, nodeId);
      messageBus.on(topic, message => this.incomingMessage(type, message));
    }
  });
};

module.exports = DummyTransportAdapter;
