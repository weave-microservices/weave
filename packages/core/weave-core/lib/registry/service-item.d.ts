import { Node } from "../shared/interfaces/node.interface";
import { ServiceItem } from "../shared/interfaces/service-item.interface";
import { ServiceSettings } from "../shared/types/service-settings.type";
export declare function createServiceItem(node: Node, name: string, version: number, settings: ServiceSettings, isLocal: boolean): ServiceItem;
