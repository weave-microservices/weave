/// <reference types="node" />
import { Writable } from 'stream';
export declare class TCPWriteStream extends Writable {
    private buffer;
    private adapter;
    private socket;
    private messageTypeHelper;
    private maxPacketSize;
    constructor(adapter: any, socket: any, maxPacketSize: any);
    _write(chunk: any, encoding: any, callback: any): any;
}
