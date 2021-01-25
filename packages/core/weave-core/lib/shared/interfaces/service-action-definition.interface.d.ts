import { Context } from "./context.interface";
export interface ServiceActionDefinition {
    params?: Object;
    handler(context: Context): Promise<any>;
}
