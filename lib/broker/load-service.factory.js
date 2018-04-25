/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const path = require('path')

const loadServiceFactory = ({ createService, servicesChanged }) =>
    fileName => {
        const filePath = path.resolve(fileName)
        const schema = require(filePath)
        createService(schema)
        servicesChanged(true)
        return schema
    }

module.exports = loadServiceFactory
