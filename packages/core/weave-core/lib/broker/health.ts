/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import os from 'os'
import { bytesToSize } from '@weave-js/utils'
import { Broker } from './broker'
import { Transport } from '../transport/transport-factory'
import { NodeClient } from '../registry/node'

export interface HealthHandler {
  init (broker: Broker, transport: Transport): void,
  getClientInfo(): NodeClient,
  getOsInfos(): any,
  getProcessInfos(): any,
  getMemoryInfos(): any,
  getCPUInfos(): any,
  getTransportInfos(): any,
  getNodeHealthInfo(): any
}

export function createHealth (): HealthHandler {
  let brokerInstance: Broker
  let transportReference: Transport

  return {
    init (broker: Broker, transport) {
      brokerInstance = broker
      transportReference = transport
    },
    getClientInfo () {
      return {
        type: 'node',
        version: brokerInstance.version,
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
      if (transportReference) {
        return Object.assign({}, transportReference.statistics)
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
        transport: this.getTransportInfos(transportReference)
      }
    }
  }
}
