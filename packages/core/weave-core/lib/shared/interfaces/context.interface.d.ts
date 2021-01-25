import { ActionOptions } from "../types/action.type";
import { EventOptions } from "../types/event-options.type";
import { Endpoint } from "./endpoint.interface";
import { ServiceAction } from "./service-action.interface";
import { Service } from "./service.interface";
export interface Context {
    id?: string;
    requestId?: string;
    nodeId: string;
    callerNodeId?: string;
    parentContext?: Context;
    parentId?: string;
    endpoint?: Endpoint;
    data: Object;
    meta: Object;
    info: any;
    level: number;
    retryCount?: number;
    tracing: Object;
    span: Object;
    service: Service;
    action?: ServiceAction;
    eventType?: string;
    eventName?: string;
    eventGroups?: Array<string>;
    options: ActionOptions;
    duration: number;
    stopTime: number;
    metrics?: any;
    setData(newParams: Object): void;
    setEndpoint(endpoint: Endpoint): void;
    call(actionName: string, data: Object, options: ActionOptions): ContextPromise<any>;
    emit(eventName: string, payload: Object, options?: EventOptions): any;
    broadcast(eventName: string, payload: Object, options: EventOptions): any;
    startSpan(name: string, options: any): any;
    finishSpan(): any;
    copy(): Context;
}
export interface ContextPromise<T> extends Promise<T> {
    context?: Context;
}
