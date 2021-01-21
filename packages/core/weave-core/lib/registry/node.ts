/*
 * Author: Kevin Ries (kevin@fachw3rk.de)
 * -----
 * Copyright 2020 Fachwerk
 */

import { cpuUsage } from '@weave-js/utils';
import { Service } from './service';

export type NodeClient = {
  type?: string,
  version?: string,
  nodejsVersion?: string
}

export type NodeInfo = {
  type?: string,
  version?: string
}

export interface Node {
  id: string,
  info: NodeInfo,
  isLocal: Boolean,
  client: NodeClient,
  cpu?: number,
  cpuSequence?: number,
  lastHeartbeatTime: number,
  offlineTime: number,
  isAvailable: Boolean,
  services: Array<Service>,
  port?: number,
  sequence: number,
  events?: Array<string>,
  IPList: Array<string>,
  update(payload: any, isReconnect: Boolean): boolean,
  updateLocalInfo(): void,
  heartbeat(payload: any): void,
  disconnected(): void
}

/**
 * Create a new node with given node ID.
 * @export
 * @param {string} nodeId
 * @returns {Node}
 */
export function createNode(nodeId: string): Node {
  const newNode: Node = {
    id: nodeId,
    info: null,
    isLocal: false,
    client: {
      type: null,
      version: null
    },
    cpu: null,
    cpuSequence: null,
    lastHeartbeatTime: Date.now(),
    offlineTime: null,
    isAvailable: true,
    services: [],
    sequence: 0,
    events: null,
    IPList: [],
    update (payload, isReconnected) {
      const newSequence = payload.sequence || 1

      this.services = payload.services
      this.events = payload.events
      this.client = payload.client || {}
      this.IPList = payload.IPList || []
      this.info = payload

      if ((newSequence > this.sequence) || isReconnected === true) {
        this.sequence = newSequence
        this.offlineTime = null

        return true
      }

      return false
    },
    async updateLocalInfo () {
      const result = await cpuUsage()
      const newVal = Math.round(result.avg)

      if (this.cpu !== newVal) {
        this.cpu = Math.round(result.avg)
        this.cpuSequence++
      }
    },
    heartbeat (payload) {
      if (!this.isAvailable) {
        this.isAvailable = true
        this.offlineTime = null
      }

      if (payload.cpu !== null) {
        this.cpu = payload.cpu
        this.cpuSequence = payload.cpuSequence || 1
      }

      this.lastHeartbeatTime = Date.now()
    },
    disconnected () {
      if (this.isAvailable) {
        this.offlineTime = Date.now()
        this.sequence++
      }

      this.isAvailable = false
    }
  }

  return newNode
}
