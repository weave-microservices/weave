/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

module.exports = ({ state, sendNodeInfo, tr }) =>
    () => {
        // todo: implement set ready
        if (tr.isConnected) {
            tr.isReady = true
            sendNodeInfo()
        }
    }
