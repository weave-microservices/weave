import { Broker } from "../shared/interfaces/broker.interface";
import { Node } from "../shared/interfaces/node.interface";
import { Service } from "../shared/interfaces/service.interface";
export declare function createEventEndpoint(broker: Broker, node: Node, service: Service, event: any): any;
