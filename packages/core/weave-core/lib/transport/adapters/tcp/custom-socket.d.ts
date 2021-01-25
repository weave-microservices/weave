/// <reference types="node" />
import { Socket } from 'net';
export declare class CustomSocket extends Socket {
    nodeId: string;
    lastUsage: number;
}
