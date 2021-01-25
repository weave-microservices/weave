"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const counter_1 = __importDefault(require("./counter"));
const gauge_1 = __importDefault(require("./gauge"));
const info_1 = __importDefault(require("./info"));
const types = {
    Counter: counter_1.default,
    Gauge: gauge_1.default,
    Info: info_1.default
};
const getByName = (name) => {
    const n = Object.keys(types).find(i => i.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (n) {
        return types[n];
    }
};
module.exports = {
    resolve(type) {
        return getByName(type);
    }
};
//# sourceMappingURL=index.js.map