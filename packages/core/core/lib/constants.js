/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2021 Fachwerk
 */

exports.PROTOCOL_VERSION = 1

exports.loadBalancingStrategy = {
  ROUND_ROBIN: 'round_robin',
  RANDOM: 'random'
}

exports.circuitBreakerStates = {
  CIRCUIT_CLOSED: 'closed',
  CIRCUIT_HALF_OPENED: 'half_opened',
  CIRCUIT_HALF_OPEN_WAITING: 'half_open_waiting',
  CIRCUIT_OPENED: 'opened'
}

exports.level = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'fatal'
}
