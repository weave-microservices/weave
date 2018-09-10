/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */
'use strict'

const fs = require('fs')

const serviceWatcherFactory = ({ log, loadService }) => {
    return {
        onServiceChanged: function () {},
        watch: function (service) {
            if (service.filename) {
                const watcher = fs.watch(service.filename, (eventType, filename) => {
                    log.info(`The Service ${service.name} has been changed. ${eventType}`)
                    // hotreaload -> destroyService -> loadService
                    watcher.close()
                    this.onServiceChanged(service)
                })
            }
        }
    }
}

module.exports = serviceWatcherFactory
