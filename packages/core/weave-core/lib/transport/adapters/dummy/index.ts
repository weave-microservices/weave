/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
*/

import  createTransportBase, { TransportAdapter } from '../adapter-base'
import { EventEmitter2 as EventEmitter } from 'eventemitter2'

global.bus = new EventEmitter({
    wildcard: true,
    maxListeners: 100
});

export default function Dummy(adapterOptions): TransportAdapter {
    const messageBus = global.bus;
    
    return Object.assign(createTransportBase(), {
        name: 'Dummy',
        connect() {
            this.bus.emit('$adapter.connected', false);
            this.log.info('Dummy transport client connected.');
            return Promise.resolve();
        },
        close() {
            return Promise.resolve();
        },
        send(message) {
            const data = this.serialize(message);
            const topic = this.getTopic(message.type, message.targetNodeId);
            messageBus.emit(topic, data);
            return Promise.resolve();
        },
        subscribe(type, nodeId) {
            const topic = this.getTopic(type, nodeId);
            messageBus.on(topic, message => this.incommingMessage(type, message));
        }
    });
};
