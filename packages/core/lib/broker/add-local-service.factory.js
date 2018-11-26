/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const addLocalServiceFactory = ({ state, registry, servicesChanged }) =>
    (service, registryItem) => {
        state.services.push(service)
        registry.registerLocalService(registryItem)
        servicesChanged(true)
    }

module.exports = addLocalServiceFactory
