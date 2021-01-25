/// <reference types="node" />
export declare function makeJsonSerializer(options: any): {
    init(): void;
    serialize(obj: any): never;
    deserialize(obj: any): never;
} & {
    serialize(obj: any): Buffer;
    deserialize(buffer: any): any;
};
