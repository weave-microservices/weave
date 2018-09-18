/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ adapter, stats }) =>
    (packet) => {
        stats.packets.sent = stats.packets.sent + 1
        return adapter.preSend(packet)
    }
