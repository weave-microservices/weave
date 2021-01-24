import { Broker } from "./broker.interface";
import { MiddlewareHandler } from "./middleware-handler.interface";

export interface Registry {
    broker: Broker
    log: Logger,
    nodes: NodeCollection,
    services: ServiceCollection,
    actions: ServiceActionCollection,
    events: EventCollection,
    init(broker: Broker, middlewareHandler: MiddlewareHandler, serviceChanged: ServiceChangedDelegate),
    onRegisterLocalAction(): void,
    onRegisterRemoteAction(): void,
    checkActionVisibility(action: any, node: any),
    middlewareHandler: MiddlewareHandler,
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