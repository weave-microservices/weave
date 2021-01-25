import { ServiceCollectionListFilterParams } from "../types/service-collection-list-filter-params.type";
import { ServiceSettings } from "../types/service-settings.type";
import { EndpointCollection } from "./endpoint-collection.interface";
import { Node } from "./node.interface";
import { ServiceAction } from "./service-action.interface";
import { ServiceItem } from "./service-item.interface";
export interface ServiceCollection {
    services: Array<ServiceItem>;
    add(node: Node, name: string, version: number, settings: ServiceSettings): ServiceItem;
    get(nodeId: string, serviceName: string, version: number): any;
    has(serviceName: string, version?: number, nodeId?: string): boolean;
    remove(nodeId: string, serviceName: string, version: number): void;
    removeAllByNodeId(nodeId: string): void;
    registerAction(nodeId: string, action: ServiceAction): any;
    tryFindActionsByActionName(actionName: string): EndpointCollection;
    getLocalActions(): Array<Object>;
    getActionsList(): Array<Object>;
    list(filterParams: ServiceCollectionListFilterParams): any;
}
