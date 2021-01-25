import { Endpoint } from "./endpoint.interface";
import { Node } from "./node.interface";
import { ServiceAction } from "./service-action.interface";
import { Service } from "./service.interface";

export interface EndpointCollection {
    name: string,
    groupName: string,
    isInternal: boolean,
    endpoints: Array<Endpoint>,
    localEndpoints: Array<Endpoint>,
    add(node: Node, service: Service, action?: ServiceAction): boolean,
    hasAvailable(): boolean,
    hasLocal(): boolean,
    getNextAvailableEndpoint(): Endpoint,
    getNextLocalEndpoint(): Endpoint,
    count(): number,
    getByNodeId(nodeId: string): Endpoint,
    removeByNodeId(nodeId: string): void,
    removeByService(service: Service): void
  }