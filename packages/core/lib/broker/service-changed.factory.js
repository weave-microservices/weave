/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const serviceChangedFactory = ({ state, transport, broadcastLocal }) =>
    /**
     * Notify about service changes.
     * @param {any} isLocalService
     */
    (isLocalService) => {
        broadcastLocal('$services.changed', { isLocalService })
        if (state.isStarted && isLocalService && transport) {
            transport.sendNodeInfo()
        }
    }

module.exports = serviceChangedFactory
