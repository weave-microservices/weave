/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const path = require('path')
const glob = require('tiny-glob')

const loadServicesFactory = ({ log, loadService }) =>
    (folder = './services', fileMask = '*.service.js') => {
        log.info(`Searching services in folder '${folder}' with name pattern '${fileMask}'.`)
        return glob(path.join(folder, fileMask))
            .then(serviceFiles => {
                // const serviceFiles = glob.sync(path.join(folder, fileMask))
                log.info(`${serviceFiles.length} services found.`)
                serviceFiles.forEach(fileName => loadService(fileName))
                return serviceFiles.length
            })
    }

module.exports = loadServicesFactory
