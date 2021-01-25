import { NodeClient } from "../types/node-client.type";
import { Broker } from "./broker.interface";
import { Transport } from "./transport.interface";

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