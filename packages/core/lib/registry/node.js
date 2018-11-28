/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const { cpuUsage } = require('fachwork')
class Node {
    constructor (nodeId) {
        this.id = nodeId
        this.isLocal = false
        this.client = null
        this.cpu = null
        this.lastHeartbeatTime = Date.now()
        this.isAvailable = true
        this.services = []
        this.events = null
        this.IPList = []
    }

    update (payload) {
        this.services = payload.services
        this.client = payload.client || {}
        this.IPList = payload.IPList || []
    }

    updateLocalInfo () {
        cpuUsage().then(result => {
            const newVal = Math.round(result.avg)
            if (this.cpu !== newVal) {
                this.cpu = Math.round(result.avg)
            }
        })
    }

    heartbeat (payload) {
        this.lastHeartbeatTime = Date.now()
        this.cpu = payload.cpu
        this.isAvailable = true
    }

    disconnected (isUnexpected) {
        this.isAvailable = false
    }
}

module.exports = Node
