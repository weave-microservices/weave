import { Context } from "../interfaces/context.interface";
export declare type ServiceEvent = {
    params?: Object;
    handler(context: Context): Promise<any>;
};
