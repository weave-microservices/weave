import { Broker } from "../interfaces/broker.interface";
import { Context } from "../interfaces/context.interface";

export type ContextFactory = {
  init(broker: Broker): void,
  create(endpoint: Endpoint, data: any, options: any): Context
}