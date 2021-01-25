"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
Object.defineProperty(exports, "__esModule", { value: true });
const eventemitter2_1 = require("eventemitter2");
function TransportAdapterBase() {
    let prefix = 'weave';
    let broker;
    let transport;
    let messageHandler;
    let log;
    const baseTransportAdapter = {
        name: null,
        broker,
        transport,
        messageHandler,
        log,
        bus: new eventemitter2_1.EventEmitter2(),
        afterInit: null,
        isConnected: false,
        interruptCounter: 0,
        repeatAttemptCounter: 0,
        init(b, t, m) {
            broker = b;
            transport = t;
            log = transport.log;
            messageHandler = m;
            if (broker.options.namespace) {
                prefix = `${prefix}-${broker.options.namespace}`;
            }
            if (this.afterInit) {
                this.afterInit();
            }
            return Promise.resolve();
        },
        subscribe(type, nodeId) {
            return Promise.resolve();
        },
        connect() {
            return Promise.resolve();
        },
        close() {
            return Promise.resolve();
        },
        /**
         *
         * Connection handler
         * @instance
         * @param {*} connectionEventParams Connection event
         * @param {boolean} [startHeartbeatTimers=true] Start timers for this adapter
         * @returns {void}
        */
        connected(features) {
            this.bus.emit('$adapter.connected', features);
        },
        disconnected() {
            this.bus.emit('$adapter.disconnected');
        },
        getTopic(cmd, nodeId) {
            return prefix + '.' + cmd + (nodeId ? '.' + nodeId : '');
        },
        preSend(message) {
            return this.send(message);
        },
        send(message) {
            return this.broker.handleError(new Error('Method "send" not implemented.'));
        },
        incommingMessage(messageType, message) {
            const data = this.deserialize(message);
            this.updateStatisticReceived(message.length);
            this.bus.emit('$adapter.message', messageType, data);
        },
        serialize(packet) {
            try {
                // Add the sender to each outgoing message
                packet.payload.sender = this.broker.nodeId;
                return Buffer.from(JSON.stringify(packet));
            }
            catch (error) {
                this.broker.handleError(error);
            }
        },
        deserialize(packet) {
            try {
                return JSON.parse(packet);
            }
            catch (error) {
                this.broker.handleError(error);
            }
        },
        updateStatisticReceived(length) {
            this.transport.statistics.received.packages += length;
        },
        updateStatisticSent(length) {
            this.transport.statistics.sent.packages += length;
        }
    };
    return baseTransportAdapter;
}
exports.default = TransportAdapterBase;
//# sourceMappingURL=adapter-base.js.map