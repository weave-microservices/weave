import { ServiceEvent } from "../types/service-event.type";
import { ServiceSettings } from "../types/service-settings.type";
import { ServiceActionDefinition } from "./service-action-definition.interface";
export interface ServiceSchema {
    name: string;
    version?: number;
    mixins: Array<ServiceSchema> | ServiceSchema;
    settings: ServiceSettings;
    meta?: Object;
    hooks: {
        [key: string]: Function;
    };
    actions?: {
        [key: string]: ServiceActionDefinition;
    };
    events?: {
        [key: string]: ServiceEvent;
    };
    methods?: {
        [key: string]: Function;
    };
    created(): any;
    started(): any;
    stopped(): any;
}
