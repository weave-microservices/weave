import { ServiceSettings } from "./service-settings.type";

export type ServiceRegistrationObject = {
    name: string,
    fullyQualifiedName: string,
    settings: ServiceSettings,
    meta: any
    version: number,
    actions: any,
    events: any
}