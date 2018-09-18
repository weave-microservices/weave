/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = {
    ROUND_ROBIN: 'round_robin',
    RANDOM: 'random'
}

module.exports.LIFECYCLE_HOOKS = [
    'created',
    'started',
    'stopped'
]

module.exports.LOG_LEVEL = {
    trace: 'trace',
    info: 'info',
    debug: 'debug',
    warn: 'warn',
    fatal: 'fatal'
}
