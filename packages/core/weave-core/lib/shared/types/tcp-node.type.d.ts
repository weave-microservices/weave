import { Node } from "../interfaces/node.interface";
export interface TCPNode extends Node {
    hostname?: string;
    port?: number;
}
