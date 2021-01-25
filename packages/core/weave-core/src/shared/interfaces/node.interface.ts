import { NodeClient } from "../types/node-client.type";
import { NodeInfo } from "../types/node-info.type";
import { ServiceItem } from "./service-item.interface";

export interface Node {
  id: string,
  info: NodeInfo,
  isLocal: boolean,
  client: NodeClient,
  cpu?: number,
  cpuSequence?: number,
  lastHeartbeatTime: number,
  offlineTime: number,
  isAvailable: boolean,
  services: Array<ServiceItem>,
  sequence: number,
  events?: Array<string>,
  IPList: Array<string>,
  update(payload: any, isReconnect: boolean): boolean,
  updateLocalInfo(): void,
  heartbeat(payload: any): void,
  disconnected(isUnexpected?: boolean): void
}