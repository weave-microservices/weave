export type BulkheadOptions = {
  enabled?: boolean;
  concurrentCalls: number;
  maxQueueSize: number;
}

export type CacheLockOptions = {
  enabled: boolean;
}

export type CacheOptions = {
  enabled?: boolean;
  adapter: string | object;
  ttl: number;
  lock?: CacheLockOptions;
}

export type ContextTracking = {
  enabled: boolean;
  shutdownTimeout: number;
}

export type StrictModeOptions = 'remove' | 'error'

export type ValidatorOptions = {
  strict: boolean;
  strictMode: StrictModeOptions;
}

export type BrokerOptions = {
  nodeId?: string;
  namespace?: string;
  bulkhead?: BulkheadOptions;
  cache?: CacheOptions;
  contextTracking?: ContextTracking;
  circuitBreaker?: CircuitBreakerOptions;
  transport?: TransportOptions;
  errorHandler?: Function;
  loadInternalMiddlewares?: boolean;
  metrics?: MetricsOptions;
  middlewares?: Array<Middleware>;
  logger?: LoggerOptions;
  tracing?: TracingOptions;
  registry?: RegistryOptions;
  retryPolicy?: RetryPolicyOptions;
  validatorOptions?: ValidatorOptions;
  validateActionParams?: boolean;
  waitForServiceInterval?: number;
  beforeRegisterMiddlewares?: Function;
  uuidFactory?: Function;
  started?: Function;
  stopped?: Function;
}

export type CircuitBreakerOptions = {
  enabled: boolean;
  halfOpenTimeout: number;
  maxFailures: number;
  windowTime: number;
}

export type RetryPolicyOptions = {
  enabled: boolean;
  delay: number;
  retries: number;
}

export type TransportOptions = {
  adapter?: string | object;
  maxQueueSize: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  localNodeUpdateInterval: number;
  offlineNodeCheckInterval: number;
  maxOfflineTime: number;
  maxChunkSize: number;
  streams: TransportStreamOptions;
}

export type TransportStreamOptions = {
  handleBackpressure: boolean;
}
export type Context = {
  id?: string;
}

export type Broker = {
  nodeId: string;
  namespace?: string;
  runtime: Runtime;
  bus: EventEmitter;
  version: string;
  options: BrokerOptions;
  metrics?: MetricRegistry;
  validator: Validator;
  start(): Promise<any>;
  stop(): Promise<any>;
  createService(schema: ServiceSchema): Service;
  loadService(path: string): void;
  loadServices(folder: string, fileMask?: string): void;
  contextFactory: ContextFactory;
  log: Logger;
  createLogger(name: string, params?: any): Logger;
  cache?: Cache;
  getUUID(): string;
  registry: Registry;
  tracer?: Tracer;
  transport?: Transport;
  getNextActionEndpoint(actionName: string): Endpoint | Error;
  call(actionName: string, params?: any, opts?: CallOptions): Promise<any>;
  multiCall(calls: Array<CallAction>): Promise<Array<any>>;
  emit(eventName: string, payload?: any, opts?: EmitOptions): Promise<any>;
  broadcast(eventName: string, payload?: any, opts?: BroadcastOptions): Promise<any>;
  broadcastLocal(eventName: string, payload?: any, opts?: BroadcastOptions): Promise<any>;
  waitForServices(serviceNames: Array<string> | string): Promise<any>;
  ping(nodeID: string, timeout?: number): Promise<PingResult>;
  handleError(err: Error): void;
  fatalError(err: Error): void;
}

