/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const addLocalServiceFactory = ({ registry, servicesChanged }) =>
    registryItem => {
        registry.registerLocalService(registryItem)
        servicesChanged(true)
    }

module.exports = addLocalServiceFactory
