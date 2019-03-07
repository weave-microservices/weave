/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const fs = require('fs')
const { debounce } = require('fachwork')

const serviceWatcherFactory = ({ log }) => {
    return {
        onServiceChanged: function () {},
        watch: function (service) {
            if (service.filename) {
                const debouncedOnServiceChange = debounce(this.onServiceChanged, 500)
                const watcher = fs.watch(service.filename, (eventType, filename) => {
                    log.info(`The Service ${service.name} has been changed. ${eventType}`)
                    watcher.close()
                    debouncedOnServiceChange(service)
                })
            }
        }
    }
}

module.exports = serviceWatcherFactory
