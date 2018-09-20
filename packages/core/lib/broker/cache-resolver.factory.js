/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const serviceChangedFactory = ({ options }) =>
    /**
     * Notify about service changes.
     * @param {any} isLocalService
     */
    (isLocalService) => {
        if (typeof options.cacher === 'object') {
            return options.cacher
        }
    }

module.exports = serviceChangedFactory
