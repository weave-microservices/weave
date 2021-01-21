"use strict";
/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadBalancingStrategy = void 0;
var LoadBalancingStrategy;
(function (LoadBalancingStrategy) {
    LoadBalancingStrategy["RoundRobin"] = "round_robin";
    LoadBalancingStrategy["Random"] = "random";
})(LoadBalancingStrategy = exports.LoadBalancingStrategy || (exports.LoadBalancingStrategy = {}));
// exports.PROTOCOL_VERSION = 1
// exports.loadBalancingStrategy = {
//   ROUND_ROBIN: 'round_robin',
//   RANDOM: 'random'
// }
// exports.logLevel = {
//   trace: 'trace',
//   debug: 'debug',
//   info: 'info',
//   warn: 'warn',
//   error: 'error',
//   fatal: 'fatal'
// }
