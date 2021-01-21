"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../../errors");
const fromURI_1 = __importDefault(require("./fromURI"));
const getAdapterByName_1 = __importDefault(require("./getAdapterByName"));
const adapters = __importStar(require("./adapters"));
const resolve = (broker, options) => {
    if (typeof options === 'object') {
        if (typeof options.adapter === 'string') {
            const Adapter = getAdapterByName_1.default(options.adapter);
            if (Adapter) {
                return Adapter(options.options);
            }
            else {
                broker.handleError(new errors_1.WeaveBrokerOptionsError(`Invalid transport settings: ${options.adapter}`));
            }
        }
        return options.adapter;
    }
    return null;
};
exports.default = Object.assign({ resolve, fromURI: fromURI_1.default }, adapters);
