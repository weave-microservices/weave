import { MiddlewareEventDelegate } from "../types/middleware-handler-delegate.type";
import { Broker } from "./broker.interface";
import { ServiceAction } from "./service-action.interface";
export interface Middleware {
    created?: () => any;
    started?: (broker: Broker) => any;
    localAction?: (handler: any, action: ServiceAction) => any;
    remoteAction?: (handler: any, action: ServiceAction) => any;
    localEvent?: (broker: Broker, handler: any, action: ServiceAction) => any;
    emit?: (next: Function) => MiddlewareEventDelegate;
    broadcast?: (next: Function) => MiddlewareEventDelegate;
    broadcastLocal?: (next: Function) => MiddlewareEventDelegate;
    brokerStopped?: () => any;
}
