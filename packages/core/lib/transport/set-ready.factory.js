/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ state, sendNodeInfo, transport }) =>
    () => {
        if (transport.isConnected) {
            transport.isReady = true
            sendNodeInfo()
        }
    }
