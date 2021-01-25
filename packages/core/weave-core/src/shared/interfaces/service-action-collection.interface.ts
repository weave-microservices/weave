import { ServiceActionListFilterParameters } from "../types/service-actions-list-filter-parameters.type";
import { EndpointCollection } from "./endpoint-collection.interface";
import { Node } from "./node.interface";
import { ServiceAction } from "./service-action.interface";
import { Service } from "./service.interface";

export interface ServiceActionCollection {
  add(node: Node, service: Service, action: ServiceAction),
  get(actionName: string): EndpointCollection,
  removeByService(service: Service): void,
  remove(actionName: string, node: Node): void,
  list(filterParams: ServiceActionListFilterParameters): Array<any>
}