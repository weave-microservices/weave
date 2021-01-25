import { WeaveError } from "../../errors";
import { NodeCollectionListFilterParams } from "../types/node-collection-list-filter-params.type";
import { NodeInfo } from "../types/node-info.type";
import { ServiceActionListFilterParameters } from "../types/service-actions-list-filter-parameters.type";
import { ServiceChangedDelegate } from "../types/service-changed-delegate.type";
import { ServiceCollectionListFilterParams } from "../types/service-collection-list-filter-params.type";
import { ServiceRegistrationObject } from "../types/service-registration-object.type";
import { Broker } from "./broker.interface";
import { EndpointCollection } from "./endpoint-collection.interface";
import { Endpoint } from "./endpoint.interface";
import { EventCollection } from "./event-collection.inteface";
import { Logger } from "./logger.interface";
import { MiddlewareHandler } from "./middleware-handler.interface";
import { NodeCollection } from "./node-collection.interface";
import { Node } from "./node.interface";
import { ServiceActionCollection } from "./service-action-collection.interface";
import { ServiceAction } from "./service-action.interface";
import { ServiceCollection } from "./service-collection.interface";
import { ServiceItem } from "./service-item.interface";
import { ServiceSchema } from "./service-schema.interface";

export interface Registry {
    broker?: Broker
    log?: Logger,
    nodeCollection?: NodeCollection,
    serviceCollection?: ServiceCollection,
    actionCollection?: ServiceActionCollection,
    eventCollection?: EventCollection,
    middlewareHandler?: MiddlewareHandler,
    init(broker: Broker, middlewareHandler: MiddlewareHandler, serviceChanged: ServiceChangedDelegate),
    onRegisterLocalAction(): void,
    onRegisterRemoteAction(): void,
    checkActionVisibility(action: any, node: any),
    deregisterService(serviceName: string, version?: number, nodeId?: string): void,
    registerLocalService(serviceRegistrationObject: ServiceRegistrationObject): void,
    registerRemoteServices(node: Node, services: Array<ServiceSchema>): void,
    registerActions(node: Node, service: ServiceItem, actions: any): void,
    registerEvents(node: Node, service: ServiceItem, events: any): void,
    getNextAvailableActionEndpoint(actionName: string, nodeId?: string): Endpoint | WeaveError,
    getActionList(options: ServiceActionListFilterParameters): Array<any>,
    deregisterServiceByNodeId(nodeId: string): void,
    hasService(serviceName: string, version?: number, nodeId?: string): boolean,
    getActionEndpointByNodeId(actionName: string, nodeId: string): Endpoint,
    getActionEndpoints(actionName: string): EndpointCollection,
    createPrivateActionEndpoint(action: ServiceAction): Endpoint,
    getLocalActionEndpoint(actionName: string): Endpoint,
    getNodeInfo(nodeId: string): NodeInfo,
    getLocalNodeInfo(forceGenerateInfo?: boolean): NodeInfo,
    generateLocalNodeInfo(incrementSequence?: boolean): NodeInfo,
    processNodeInfo(payload: any),
    nodeDisconnected(nodeId: string, isUnexpected?: boolean): void,
    removeNode(nodeId: string): void,
    getNodeList(filterParams: NodeCollectionListFilterParams): Array<any>,
    getServiceList(filterParams: ServiceCollectionListFilterParams): Array<any>
}