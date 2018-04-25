/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

serviceChangedFactory = ({ transport, broadcastLocal }) =>
    /**
     * Notify about service changes.
     * @param {any} isLocalService 
     */
    (isLocalService) => {
        broadcastLocal('$services.changed', { isLocalService })

        if (isLocalService && transport) {
            transport.sendNodeInfo()
        }
    }

module.exports = serviceChangedFactory
