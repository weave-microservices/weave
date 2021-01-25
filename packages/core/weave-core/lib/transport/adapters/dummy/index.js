"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapter_base_1 = __importDefault(require("../adapter-base"));
const eventemitter2_1 = require("eventemitter2");
global.bus = new eventemitter2_1.EventEmitter2({
    wildcard: true,
    maxListeners: 100
});
function Dummy(adapterOptions) {
    const messageBus = global.bus;
    return Object.assign(adapter_base_1.default(), {
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
}
exports.default = Dummy;
;
//# sourceMappingURL=index.js.map