/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

module.exports.loadBalancingStrategy = {
  ROUND_ROBIN: 'round_robin',
  RANDOM: 'random'
}

module.exports.lifecycleHook = [
  'created',
  'started',
  'stopped'
]

module.exports.logLevel = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'fatal'
}
