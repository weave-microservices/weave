/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const addLocalServiceFactory = ({ state }) =>
    (service) => {
        state.services.push(service)
    }

module.exports = addLocalServiceFactory
