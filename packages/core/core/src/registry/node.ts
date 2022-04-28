/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
*/

const { cpuUsage: getCpuUsage } = require('@weave-js/utils');

class Node {
  id: string;
  isLocal: boolean;
  isAvailable: boolean;
  services?: Array<any>;
  events?: Array<any>;
  weaveClient?: {
    id: string;
    name: string;
  }
  IPList?: Array<string>;
  info?: any;
  sequence?: number;
  cpu?: number;
  cpuSequence?: number;
  offlineTime?: number | undefined;
  lastHeartbeatTime?: number | undefined;
  isUnexpectedDisconnected?: boolean;

  constructor (nodeId: string) {
    this.id = nodeId
    this.isAvailable = true;
    this.isLocal = false;
  }

  update (payload: any, isReconnected: boolean = false): boolean {
    const newSequence = payload.sequence || 1;

    this.services = payload.services;
    this.events = payload.events;
    this.weaveClient = payload.weaveClient || {};
    this.IPList = payload.IPList || [];
    this.info = payload;

    if ((newSequence > this.sequence!) || isReconnected === true) {
      this.sequence = newSequence;
      delete this.offlineTime;

      return true;
    }

    return false;
  }

  async updateLocalInfo (): Promise<void> {
    const cpuUsage = await getCpuUsage()
    const newVal = Math.round(cpuUsage.avg);

    if (this.cpu !== newVal) {
      this.cpu = Math.round(cpuUsage.avg);
      this.cpuSequence!++;
    }
  }

  heartbeat (payload: any) {
    if (!this.isAvailable) {
      this.isAvailable = true;
      delete this.offlineTime;
    }

    if (payload.cpu !== null) {
      this.cpu = payload.cpu;
      this.cpuSequence = payload.cpuSequence || 1;
    }

    this.lastHeartbeatTime = Date.now();
  }

  disconnected (isUnexpected: boolean = false) {
    if (this.isAvailable) {
      this.offlineTime = Date.now();
      this.sequence!++;
      this.isUnexpectedDisconnected = isUnexpected;
    }

    this.isAvailable = false;
  }
}

export { Node };

// /**
//  * Node factory
//  * @param {string} nodeId Node id
//  * @returns {Node} Node instance
// */
// exports.createNode = (nodeId) => {
//   /**
//    * @type {Node}
//   */
//   return {
//     id: nodeId,
//     info: null,
//     isLocal: false,
//     client: {
//       type: null,
//       version: null
//     },
//     cpu: null,
//     cpuSequence: null,
//     lastHeartbeatTime: Date.now(),
//     offlineTime: null,
//     isAvailable: true,
//     isUnexpectedDisconnected: false,
//     services: [],
//     sequence: 0,
//     events: null,
//     IPList: [],
//     update (payload, isReconnected) {
//       const newSequence = payload.sequence || 1;

//       this.services = payload.services;
//       this.events = payload.events;
//       this.client = payload.client || {};
//       this.IPList = payload.IPList || [];
//       this.info = payload;

//       if ((newSequence > this.sequence) || isReconnected === true) {
//         this.sequence = newSequence;
//         this.offlineTime = null;

//         return true;
//       }
//       return false;
//     },
//     updateLocalInfo () {
//       cpuUsage().then(result => {
//         const newVal = Math.round(result.avg);

//         if (this.cpu !== newVal) {
//           this.cpu = Math.round(result.avg);
//           this.cpuSequence++;
//         }
//       });
//     },
//     heartbeat (payload) {
//       if (!this.isAvailable) {
//         this.isAvailable = true;
//         this.offlineTime = null;
//       }

//       if (payload.cpu !== null) {
//         this.cpu = payload.cpu;
//         this.cpuSequence = payload.cpuSequence || 1;
//       }

//       this.lastHeartbeatTime = Date.now();
//     },
//     disconnected (isUnexpected = false) {
//       if (this.isAvailable) {
//         this.offlineTime = Date.now();
//         this.sequence++;
//         this.isUnexpectedDisconnected = isUnexpected;
//       }

//       this.isAvailable = false;
//     }
//   };
// };
