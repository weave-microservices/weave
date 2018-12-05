/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ adapter, stats, log }) =>
    (message) => {
        stats.packets.sent = stats.packets.sent + 1
        log.debug(`Send ${message.type.toUpperCase()} packet to ${message.targetNodeId || 'all nodes'}`)
        return adapter.preSend(message)
    }
