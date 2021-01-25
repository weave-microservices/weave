import { ActionOptions } from "../types/action.type";
import { ServiceSettings } from "../types/service-settings.type";
import { Broker } from "./broker.interface";
import { Context } from "./context.interface";
import { Logger } from "./logger.interface";
export interface Service {
    filename: string;
    broker: Broker;
    log: Logger;
    version?: number;
    name: string;
    meta?: Object;
    fullyQualifiedName: string;
    schema: Object;
    settings: ServiceSettings;
    actions?: {
        [key: string]: (data: Object, options: ActionOptions) => {};
    };
    events?: {
        [key: string]: (context: Context) => {};
    };
    methods?: {
        [key: string]: Function;
    };
    start(): Promise<any>;
    stop(): Promise<any>;
}
