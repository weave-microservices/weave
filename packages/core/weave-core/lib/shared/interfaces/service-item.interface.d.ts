import { Node } from "./node.interface";
export interface ServiceItem {
    name: string;
    node: Node;
    settings: any;
    version: number;
    actions: any;
    events: any;
    isLocal: boolean;
    addAction(action: any): void;
    addEvent(event: any): void;
    equals(name: string, version: number, nodeId: string): boolean;
    update(service: any): void;
}
