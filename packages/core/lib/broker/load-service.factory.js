/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const path = require('path')

const loadServiceFactory = ({ createService, servicesChanged, serviceWatcher, options }) =>
    fileName => {
        const filePath = path.resolve(fileName)
        const schema = require(filePath)
        const service = createService(schema)

        if (options.watchServices) {
            service.filename = fileName
            serviceWatcher.watch(service)
        }
        return service
    }

module.exports = loadServiceFactory
