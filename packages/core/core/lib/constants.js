/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

exports.loadBalancingStrategy = {
  ROUND_ROBIN: 'round_robin',
  RANDOM: 'random'
}

exports.lifecycleHook = [
  'created',
  'started',
  'stopped'
]

exports.logLevel = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
  fatal: 'fatal'
}
