/// <reference types="node" />
export interface UdpDiscoverySerializer {
    encode(object: any): Buffer;
    decode(buffer: Buffer): any;
}
export declare function createCodec(): UdpDiscoverySerializer;
