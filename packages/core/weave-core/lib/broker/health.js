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
const os_1 = __importDefault(require("os"));
const utils_1 = require("@weave-js/utils");
function createHealth() {
    let brokerInstance;
    let transportReference;
    return {
        init(broker, transport) {
            brokerInstance = broker;
            transportReference = transport;
        },
        getClientInfo() {
            return {
                type: 'node',
                version: brokerInstance.version,
                nodeVersion: process.version
            };
        },
        getOsInfos() {
            return {
                hostname: os_1.default.hostname(),
                plattform: os_1.default.platform(),
                release: os_1.default.release(),
                type: os_1.default.type()
            };
        },
        getCPUInfos() {
            const load = os_1.default.loadavg();
            const cores = os_1.default.cpus().length;
            return {
                cores: os_1.default.cpus().length,
                utilization: Math.floor(load[0] * 100 / cores)
            };
        },
        getProcessInfos() {
            const memoryUsage = process.memoryUsage();
            return {
                pid: process.pid,
                memory: {
                    heapTotal: utils_1.bytesToSize(memoryUsage.heapTotal),
                    heapUsed: utils_1.bytesToSize(memoryUsage.heapUsed),
                    rss: utils_1.bytesToSize(memoryUsage.rss)
                },
                uptime: process.uptime()
            };
        },
        getMemoryInfos() {
            return {
                totalMemory: utils_1.bytesToSize(os_1.default.totalmem()),
                freeMemory: utils_1.bytesToSize(os_1.default.freemem())
            };
        },
        getTransportInfos() {
            if (transportReference) {
                return Object.assign({}, transportReference.statistics);
            }
            /* istanbul ignore next */
            return null;
        },
        getNodeHealthInfo() {
            return {
                nodeId: this.broker.nodeId,
                os: this.getOsInfos(),
                cpu: this.getCPUInfos(),
                memory: this.getMemoryInfos(),
                process: this.getProcessInfos(),
                client: this.getClientInfo(),
                transport: this.getTransportInfos(transportReference)
            };
        }
    };
}
exports.default = createHealth;
//# sourceMappingURL=health.js.map