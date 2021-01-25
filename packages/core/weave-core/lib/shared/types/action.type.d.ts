import { Context } from "../interfaces/context.interface";
export declare type ActionOptions = {
    nodeId?: string;
    context?: Context;
    retries?: number;
    timeout?: number;
};
