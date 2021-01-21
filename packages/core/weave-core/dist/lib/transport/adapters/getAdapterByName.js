"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adapters_1 = __importDefault(require("./adapters"));
module.exports = name => {
    if (!name) {
        return;
    }
    const foundAdapterName = Object.keys(adapters_1.default).find(adapter => adapter.toLowerCase() === name.toLowerCase());
    if (foundAdapterName) {
        return adapters_1.default[foundAdapterName];
    }
};
