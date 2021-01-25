import { LoadbalancingStrategy } from "../enums/load-balancing-strategies.enum";
export declare type RegistryOptions = {
    preferLocalActions: boolean;
    requestTimeout: number;
    maxCallLevel: number;
    loadBalancingStrategy: LoadbalancingStrategy;
};
