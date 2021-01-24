import { ActionCacheSettings } from "../types/action-cache-settings.type";
import { Broker } from "./broker.interface";
import { Context } from "./context.interface";
import { Service } from "./service.interface";

export interface ServiceAction {
  name: string,
  shortName: string,
  version?: number,
  service: Service,
  params?: Object,
  cache?: ActionCacheSettings,
  handler(context: Context, service?: Service, broker?: Broker): Promise<any>
}