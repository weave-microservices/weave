/// <reference types="node" />
declare const makeMessage: (MessageTypes: any) => (type: any, targetNodeId: any, payload: any) => {
    type: any;
    targetNodeId: any;
    payload: Buffer;
};
