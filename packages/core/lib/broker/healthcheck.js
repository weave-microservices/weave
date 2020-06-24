/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

const os = require('os')
const { bytesToSize } = require('@weave-js/utils')

const createHealthcheck = () => {
  return {
    init (broker, transport) {
      this.broker = broker
      this.transport = transport
    },
    getClientInfo () {
      return {
        type: 'node',
        version: this.broker.version,
        nodeVersion: process.version
      }
    },
    getOsInfos () {
      return {
        hostname: os.hostname(),
        plattform: os.platform(),
        release: os.release(),
        type: os.type()
      }
    },
    getCPUInfos () {
      const load = os.loadavg()
      const cores = os.cpus().length

      return {
        cores: os.cpus().length,
        utilization: Math.floor(load[0] * 100 / cores)
      }
    },
    getProcessInfos () {
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
    },
    getMemoryInfos () {
      return {
        totalMemory: bytesToSize(os.totalmem()),
        freeMemory: bytesToSize(os.freemem())
      }
    },
    getTransportInfos () {
      if (this.transport) {
        return Object.assign({}, this.transport.statistics)
      }
      /* istanbul ignore next */
      return null
    },
    getNodeHealthInfo () {
      return {
        nodeId: this.broker.nodeId,
        os: this.getOsInfos(),
        cpu: this.getCPUInfos(),
        memory: this.getMemoryInfos(),
        process: this.getProcessInfos(),
        client: this.getClientInfo(),
        transport: this.getTransportInfos(this.transport)
      }
    }
  }
}

module.exports = createHealthcheck
