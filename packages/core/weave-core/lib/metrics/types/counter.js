"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gauge_1 = __importDefault(require("./gauge"));
class Counter extends gauge_1.default {
    // constructor (store, obj) {
    //   super(store, obj)
    // }
    decrement() {
        throw new Error('Not allowed to decrement a counter');
    }
}
exports.default = Counter;
//# sourceMappingURL=counter.js.map