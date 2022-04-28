import { LoggerOptions } from "../logger/LoggerOptions";
import { Runtime } from "../runtime/Runtime";
import { Broker } from "./Broker";
import { Middleware } from "./Middleware";

export interface BrokerConfiguration {
  nodeId: string;
  namespace?: string;
  logger?: LoggerOptions;
  middlewares?: Middleware[];
  bulkhead?: BulkheadOptions;
  cache?: CacheOptions;
  circuitBreaker?: CircuitBreakerOptions;
  contextTracking?: ContextTrackingOptions;
  transport?: Transportoptions;
  loadInternalMiddlewares?: boolean;
  metrics?: MetricsOptions;
  tracing?: TracingOptions;
  registry?: RegistryOptions;
  retryPolicy?: RetryPolicyOptions;
  validateActionParams?: boolean;
  validatorOptions?: ValidatorOptions; // todo: rename to validator
  waitForServiceInterval?: number;
  uuidFactory?: (runtime: Runtime) => string;
  started?: (this: Broker) => void;
  errorHandler?: (error: Error) => void;
}