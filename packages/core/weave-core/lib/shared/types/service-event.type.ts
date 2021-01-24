import { Context } from "../interfaces/context.interface";

export type ServiceEvent = {
    params?: Object,
    handler(context: Context): Promise<any>
}
