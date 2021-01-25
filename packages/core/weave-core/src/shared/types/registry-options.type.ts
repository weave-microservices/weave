import { LoadbalancingStrategy } from "../enums/load-balancing-strategies.enum";

export type RegistryOptions = {
  preferLocalActions: boolean,
  requestTimeout: number,
  maxCallLevel: number,
  loadBalancingStrategy: LoadbalancingStrategy
}