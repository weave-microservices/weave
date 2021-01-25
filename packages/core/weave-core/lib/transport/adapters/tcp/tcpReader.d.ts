/// <reference types="node" />
import { EventEmitter } from 'events';
import { TransportAdapter } from '../../../shared/interfaces/transport-adapter.interface';
export interface TCPReader {
    bus: EventEmitter;
    isConnected: boolean;
    listen(): Promise<number>;
    close(): void;
}
export declare function createTCPReader(adapter: TransportAdapter, options: any): TCPReader;
