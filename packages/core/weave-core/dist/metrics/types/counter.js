"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Gauge = require('./gauge');
class Counter extends Gauge {
    // constructor (store, obj) {
    //   super(store, obj)
    // }
    decrement() {
        throw new Error('Not allowed to decrement a counter');
    }
}
exports.default = Counter;
