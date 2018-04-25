/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const ROUND_ROBIN = 'round_robin'
const RANDOM = 'random'

module.exports = {
    ROUND_ROBIN,
    RANDOM
}

module.exports.LIFECYCLE_HOOKS = [
    'created',
    'started',
    'stopped'
]

module.exports.LOG_LEVEL = {
    info: 'info',
    debug: 'debug',
    trace: 'trace',
    fatal: 'fatal'
}