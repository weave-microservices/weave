/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2018 Fachwerk
 */

const os = require('os')
const { bytesToSize } = require('../utils')
const WEAVE_VERSION = require('../../package.json').version

module.exports = ({ state, transport }) => {
    const getClientInfo = () => {
        return {
            type: 'nodejs',
            version: WEAVE_VERSION,
            langVersion: process.version
        }
    }

    const getOsInfos = () => {
        return {
            hostname: os.hostname(),
            pattform: os.platform(),
            release: os.release(),
            type: os.type()
        }
    }

    const getCPUInfos = () => {
        const load = os.loadavg()
        const cores = os.cpus().length

        return {
            cores: os.cpus().length,
            utilization: Math.floor(load[0] * 100 / cores)
        }
    }

    const getMemoryInfos = () => {
        return {
            totalMemory: bytesToSize(os.totalmem()),
            freeMemory: bytesToSize(os.freemem())
        }
    }

    const getProcessInfos = () => {
        const memoryUsage = process.memoryUsage()
        return {
            pid: process.pid,
            memory: {
                heapTotal: bytesToSize(memoryUsage.heapTotal),
                heapUsed: bytesToSize(memoryUsage.heapUsed),
                rss: bytesToSize(memoryUsage.rss)
            },
            uptime: process.uptime()
        }
    }

    const getTransportInfos = () => {
        if (transport) {
            return Object.assign({}, transport.stats)
        }
        return null
    }

    const getNodeHealthInfo = () => {
        return {
            nodeId: state.nodeId,
            os: getOsInfos(),
            cpu: getCPUInfos(),
            memory: getMemoryInfos(),
            process: getProcessInfos(),
            client: getClientInfo(),
            transport: getTransportInfos(transport)
        }
    }

    return {
        getCPUInfos,
        getNodeHealthInfo,
        getProcessInfos,
        getMemoryInfos,
        getOsInfos,
        getTransportInfos
    }
}
