import { Broker } from "./broker.interface";

export interface BrokerOptions {
  nodeId?: string,
  bulkhead: BulkheadOptions,
  cache: CacheOptions,
  circuitBreaker: CircuitBreakerOptions,
  transport: TransportOptions,
  errorHandler?: Function,
  loadNodeService: Boolean,
  publishNodeService: Boolean,
  loadInternalMiddlewares: Boolean,
  metrics: MetricsOptions,
  middlewares?: Array<Middleware>,
  logger?: LoggerOptions,
  tracing: TracingOptions,
  namespace?: String,
  registry?: RegistryOptions,
  retryPolicy: RetryPolicyOptions,
  validateActionParams?: Boolean,
  watchServices?: Boolean,
  waitForServiceInterval?: number,
  beforeRegisterMiddlewares?: () => string,
  uuidFactory?: () => string,
  started?: (this: Broker) => void,
  stopped?: (this: Broker) => void
}