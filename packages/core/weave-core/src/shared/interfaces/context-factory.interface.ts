import { Broker } from "./broker.interface";
import { Context } from "./context.interface";
import { Endpoint } from "./endpoint.interface";

export type ContextFactory = {
  init(broker: Broker): void,
  create(endpoint: Endpoint, data: any, options: any): Context
}