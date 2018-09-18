/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const fs = require('fs')

const serviceWatcherFactory = ({ log }) => {
    return {
        onServiceChanged: function () {},
        watch: function (service) {
            if (service.filename) {
                const watcher = fs.watch(service.filename, (eventType, filename) => {
                    log.info(`The Service ${service.name} has been changed. ${eventType}`)
                    watcher.close()
                    this.onServiceChanged(service)
                })
            }
        }
    }
}

module.exports = serviceWatcherFactory
