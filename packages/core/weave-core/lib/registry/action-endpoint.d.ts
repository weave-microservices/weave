import { Broker } from "../shared/interfaces/broker.interface";
import { Endpoint } from "../shared/interfaces/endpoint.interface";
import { Node } from "../shared/interfaces/node.interface";
import { ServiceAction } from "../shared/interfaces/service-action.interface";
import { Service } from "../shared/interfaces/service.interface";
export declare function createActionEndpoint(broker: Broker, node: Node, service: Service, action: ServiceAction): Endpoint;
