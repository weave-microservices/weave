"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNode = void 0;
const utils_1 = require("@weave-js/utils");
/**
 * Create a new node with given node ID.
 * @export
 * @param {string} nodeId
 * @returns {Node}
 */
function createNode(nodeId) {
    const newNode = {
        id: nodeId,
        info: null,
        isLocal: false,
        client: {
            type: null,
            version: null
        },
        cpu: null,
        cpuSequence: null,
        lastHeartbeatTime: Date.now(),
        offlineTime: null,
        isAvailable: true,
        services: [],
        sequence: 0,
        events: null,
        IPList: [],
        update(payload, isReconnected) {
            const newSequence = payload.sequence || 1;
            this.services = payload.services;
            this.events = payload.events;
            this.client = payload.client || {};
            this.IPList = payload.IPList || [];
            this.info = payload;
            if ((newSequence > this.sequence) || isReconnected === true) {
                this.sequence = newSequence;
                this.offlineTime = null;
                return true;
            }
            return false;
        },
        updateLocalInfo() {
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield utils_1.cpuUsage();
                const newVal = Math.round(result.avg);
                if (this.cpu !== newVal) {
                    this.cpu = Math.round(result.avg);
                    this.cpuSequence++;
                }
            });
        },
        heartbeat(payload) {
            if (!this.isAvailable) {
                this.isAvailable = true;
                this.offlineTime = null;
            }
            if (payload.cpu !== null) {
                this.cpu = payload.cpu;
                this.cpuSequence = payload.cpuSequence || 1;
            }
            this.lastHeartbeatTime = Date.now();
        },
        disconnected() {
            if (this.isAvailable) {
                this.offlineTime = Date.now();
                this.sequence++;
            }
            this.isAvailable = false;
        }
    };
    return newNode;
}
exports.createNode = createNode;
