/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

exports.PROTOCOL_VERSION = 1

exports.loadBalancingStrategy = {
  ROUND_ROBIN: 'round_robin',
  RANDOM: 'random'
}

exports.level = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'fatal'
}

exports.SYNC_MIDDLEWARE_HOOKS = {
  STARTING: 'starting'
}
