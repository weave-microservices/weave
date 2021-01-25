import { WeaveError } from "../../errors";
import { Context } from "./context.interface";
export interface TransportRequest {
    targetNodeId: string;
    action: string;
    context: Context;
    resolve(result?: any): any;
    reject(error?: WeaveError): any;
    isStream: boolean;
}
