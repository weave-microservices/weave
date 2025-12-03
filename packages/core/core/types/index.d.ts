import { Stream, Writable } from 'stream';
import { EventEmitter } from 'events';

// ===== UTILITY TYPES =====

/**
 * Log level type definition
 */
export type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Service action visibility levels
 */
export type ServiceActionVisibility = 'published' | 'public' | 'protected' | 'private';

/**
 * Type mapping for parameter validation
 */
export interface TypeMap {
  string: string;
  number: number;
  boolean: boolean;
  email: string;
  object: object;
  array: any[];
  date: Date;
  uuid: string;
  url: string;
  any: any;
}

/**
 * Utility type to convert parameter schemas to actual types
 */
export type ParamsToType<TParams extends Record<string, { type: keyof TypeMap }>> = {
  [K in keyof TParams]: TypeMap[TParams[K]['type']];
};

// ===== CORE INTERFACES =====

/**
 * Unique identifier for spans in tracing
 */
export interface Span {
  id: string;
  sampled: boolean;
  parentId?: string;
  traceId?: string;
  operationName?: string;
  startTime?: number;
  finishTime?: number;
  tags?: Record<string, any>;
  logs?: Array<{ timestamp: number; fields: Record<string, any> }>;
}

export interface SpanOptions {
  parentSpan?: Span,
  parentId?: string;
  traceId?: string;
  sampled?: boolean;
}

/**
 * Context metadata object
 */
export interface ContextMetaObject {
  user?: any;
  headers?: Record<string, any>;
  timeout?: number;
  retryCount?: number;
  requestId?: string;
  [key: string]: any;
}

/**
 * Action options for service calls
 */
export interface ActionOptions {
  context?: Context;
  parentContext?: Context;
  meta?: ContextMetaObject;
  stream?: Stream;
  timeout?: number;
  retryCount?: number;
  custom?: Record<string, any>;
  requestId?: string;
  parentSpan?: Span;
  nodeId?: string;
}

/**
 * Event options for event broadcasting
 */
export interface EventOptions {
  groups?: string[];
  nodeId?: string;
  broadcast?: boolean;
}

/**
 * Request context passed to actions and events
 */
export interface Context<T = any> {
  id?: string;
  requestId?: string;
  nodeId: string;
  callerNodeId?: string;
  parentContext?: Context;
  parentId?: string;
  endpoint?: Endpoint;
  data: T;
  meta: ContextMetaObject;
  level: number;
  retryCount?: number;
  tracing: boolean;
  span?: Span;
  isCachedResult?: boolean;
  eventType?: string;
  eventName?: string;
  eventGroups?: string[];
  options: ActionOptions;
  duration: number;
  stopTime: number;
  metrics?: any;
  service?: any;
  stream?: Stream;
  action?: any;
  startHighResolutionTime?: [number, number] | null;
  
  // Methods
  setData(data: T): void;
  call<TParams = unknown, TResult = unknown>(actionName: string, params?: TParams, options?: ActionOptions): Promise<TResult>;
  emit(eventName: string, payload?: unknown, options?: EventOptions): Promise<void>;
  broadcast(eventName: string, payload?: unknown, options?: EventOptions): Promise<void>;
  startSpan(name?: string, options?: Record<string, unknown>): Span;
  finishSpan(span?: Span, time?: number): void;
  copy(): Context<T>;
  setStream(stream: Stream): void;
  setEndpoint(endpoint: Endpoint): void;
}

// ===== LOGGER INTERFACES =====

/**
 * Logger instance interface
 */
export interface Logger {
  fatal(message: string | object, ...args: any[]): void;
  error(message: string | object, ...args: any[]): void;
  warn(message: string | object, ...args: any[]): void;
  info(message: string | object, ...args: any[]): void;
  debug(message: string | object, ...args: any[]): void;
  verbose(message: string | object, ...args: any[]): void;
  
  // Utility methods
  child(bindings: object): Logger;
  level: string;
}

/**
 * Logger configuration options
 */
export interface LoggerOptions {
  enabled?: boolean;
  level?: LogLevel;
  messageKey?: string;
  customLevels?: Record<string, number>;
  base?: Record<string, any>;
  destination?: Writable;
  colors?: boolean;
  formatter?: 'json' | 'human' | ((data: any) => string);
}

/**
 * Logger factory bindings
 */
export interface LoggerFactoryBindings {
  nodeId: string;
  moduleName: string;
  [key: string]: any;
}

/**
 * Logger factory function type
 */
export type LoggerFactoryFunction = (bindings: LoggerFactoryBindings, level?: LogLevel) => Logger;

// ===== SERVICE INTERFACES =====

/**
 * Service settings interface
 */
export interface ServiceSettings {
  [key: string]: any;
}

/**
 * Service action parameter schema
 */
export interface ServiceActionParamSchema<T extends keyof TypeMap = keyof TypeMap> {
  type: T;
  optional?: boolean;
  default?: TypeMap[T];
  min?: number;
  max?: number;
  length?: number;
  pattern?: string | RegExp;
  enum?: TypeMap[T][];
  custom?: (value: any, errors: any[]) => boolean;
  [key: string]: any;
}

/**
 * Service action schema definition
 */
export interface ServiceActionSchema<TParams extends Record<string, ServiceActionParamSchema> = any> {
  params?: TParams;
  visibility?: ServiceActionVisibility;
  cache?: boolean | object;
  timeout?: number;
  retries?: number;
  bulkhead?: object;
  circuitBreaker?: object;
  tracing?: boolean | object;
  metrics?: boolean | object;
  handler: (this: Service, context: Context<ParamsToType<TParams>>) => Promise<any> | any;
  [key: string]: any;
}

/**
 * Service action handler function
 */
export type ServiceActionHandler = (this: Service, context: Context) => Promise<any> | any;

/**
 * Service event definition
 */
export interface ServiceEvent {
  group?: string;
  handler: (this: Service, context: Context) => Promise<any> | any;
}

/**
 * Service method definition
 */
export type ServiceMethodDefinition = (this: Service, ...args: any[]) => any;

/**
 * Service lifecycle hooks
 */
export interface ServiceHooks {
  before?: {
    [actionName: string]: (context: Context) => Promise<Context> | Context;
  };
  after?: {
    [actionName: string]: (context: Context, response: any) => Promise<any> | any;
  };
  error?: {
    [actionName: string]: (context: Context, error: Error) => Promise<void> | void;
  };
}

/**
 * Service schema definition
 */
export interface ServiceSchema {
  name: string;
  version?: string | number;
  dependencies?: string[];
  mixins?: ServiceSchema[] | ServiceSchema;
  settings?: ServiceSettings;
  meta?: Record<string, any>;
  hooks?: ServiceHooks;
  actions?: Record<string, ServiceActionSchema | ServiceActionHandler | boolean>;
  events?: Record<string, ServiceEvent | ServiceActionHandler>;
  methods?: Record<string, ServiceMethodDefinition>;
  
  // Lifecycle methods
  created?(this: Service): void | Promise<void>;
  started?(this: Service): void | Promise<void>;
  stopped?(this: Service): void | Promise<void>;
  afterSchemasMerged?(this: Service): void | Promise<void>;
}

/**
 * Service instance interface
 */
export interface Service {
  filename?: string;
  runtime: Runtime;
  broker: Broker;
  log: Logger;
  version?: string | number;
  name: string;
  meta?: object;
  fullyQualifiedName: string;
  schema: ServiceSchema;
  settings: ServiceSettings;
  actions: Record<string, (data: object, options?: ActionOptions) => any>;
  events: Record<string, (context: Context) => any>;
  methods: Record<string, Function>;
  
  // Lifecycle methods
  start(): Promise<void>;
  stop(): Promise<void>;
}

// ===== REGISTRY INTERFACES =====

/**
 * Node information
 */
export interface NodeInfo {
  nodeId: string;
  instanceId: string;
  hostname: string;
  ipList: string[];
  port?: number;
  version: string;
  uptime: number;
  cpu?: number;
  memory?: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
  };
  [key: string]: any;
}

/**
 * Node client interface
 */
export interface NodeClient {
  nodeId: string;
  available: boolean;
  lastHeartbeatTime: number;
  [key: string]: any;
}

/**
 * Service item in registry
 */
export interface ServiceItem {
  name: string;
  version?: string | number;
  fullName: string;
  nodeId: string;
  node?: Node;
  actions?: Record<string, any>;
  events?: Record<string, any>;
  settings?: ServiceSettings;
  metadata?: object;
  
  // Methods
  update(service: ServiceItem): void;
  addAction(action: any): void;
  addEvent(event: any): void;
  equals(name: string, version?: string | number): boolean;
}

/**
 * Node in the registry
 */
export interface Node {
  id: string;
  info: NodeInfo;
  isLocal: boolean;
  client: NodeClient;
  cpu?: number;
  cpuSequence?: number;
  lastHeartbeatTime: number;
  offlineTime: number;
  isAvailable: boolean;
  wasDisconnectedUnexpectedly: boolean;
  services: ServiceItem[];
  sequence: number;
  events?: string[];
  IPList: string[];
  
  // Methods
  update(info: NodeInfo, isLocal?: boolean): boolean;
  updateLocalInfo(isLocal?: boolean): void;
  heartbeat(info: NodeInfo): void;
  disconnected(isLocal?: boolean): void;
}

/**
 * Service action endpoint
 */
export interface Endpoint {
  node: Node;
  service: ServiceItem;
  action: any;
  isLocal: boolean;
  state: boolean;
  name: string;
  
  // Methods
  updateAction(): void;
  isAvailable(): boolean;
}

/**
 * Registry configuration options
 */
export interface RegistryOptions {
  preferLocalActions?: boolean;
  publishNodeService?: boolean;
  requestTimeout?: number;
  maxCallLevel?: number;
  loadBalancingStrategy?: string | object;
}

/**
 * Node collection interface
 */
export interface NodeCollection {
  localNode: Node;
  get(nodeId: string): Node | undefined;
  add(nodeId: string, node: Node): void;
  remove(nodeId: string): void;
  list(params?: any): Node[];
}

/**
 * Service collection interface
 */
export interface ServiceCollection {
  services: Set<ServiceItem>;
  has(name: string, version?: string | number, nodeId?: string): boolean;
  get(nodeId: string, name: string, version?: string | number): ServiceItem | undefined;
  add(node: Node, name: string, version?: string | number, settings?: any): ServiceItem;
  remove(nodeId: string, name: string, version?: string | number): void;
  removeAllByNodeId(nodeId: string): void;
  list(params?: any): ServiceItem[];
}

/**
 * Action collection interface
 */
export interface ActionCollection {
  get(actionName: string): any;
  add(node: Node, service: ServiceItem, action: any): void;
  remove(actionName: string, node: Node): void;
}

/**
 * Event collection interface
 */
export interface EventCollection {
  get(eventName: string): any;
  add(node: Node, service: ServiceItem, event: any): void;
  remove(eventName: string, node: Node): void;
}

/**
 * Registry interface
 */
export interface Registry {
  runtime: Runtime;
  log: Logger;
  
  // Collections
  nodeCollection: NodeCollection;
  serviceCollection: ServiceCollection;
  actionCollection: ActionCollection;
  eventCollection: EventCollection;
  
  // Lifecycle
  init(runtime: Runtime): void;
  
  // Service registration
  registerLocalService(serviceItem: ServiceItem): void;
  registerRemoteServices(node: Node, services: ServiceItem[]): void;
  registerActions(node: Node, service: ServiceItem, actions: Record<string, any>): void;
  registerEvents(node: Node, service: ServiceItem, events: Record<string, any>): void;
  
  // Service deregistration
  deregisterService(serviceName: string, version?: string | number, nodeId?: string): void;
  deregisterServiceByNodeId(nodeId: string): void;
  
  // Service queries
  hasService(serviceName: string, version?: string | number, nodeId?: string): boolean;
  
  // Action endpoints
  getNextAvailableActionEndpoint(actionName: string | Endpoint, opts?: any): Endpoint | Error;
  getActionEndpointByNodeId(actionName: string, nodeId: string): Endpoint | null;
  getActionEndpoints(actionName: string): any;
  getLocalActionEndpoint(actionName: string): Endpoint | undefined;
  createPrivateActionEndpoint(action: any): Endpoint;
  
  // Action visibility
  checkActionVisibility(action: any, node: Node): boolean;
  // onRegisterLocalAction: () => void;
  // onRegisterRemoteAction: () => void;
  
  // Node info
  getNodeInfo(nodeId: string): NodeInfo | null;
  getLocalNodeInfo(forceGenerateInfo?: boolean): NodeInfo;
  generateLocalNodeInfo(incrementSequence?: boolean): NodeInfo;
  processNodeInfo(payload: any): void;
  
  // Node lifecycle
  nodeDisconnected(nodeId: string, isUnexpected?: boolean): void;
  removeNode(nodeId: string): void;
  
  // Utility
  getActionList?(filterParams?: any): any[];
}

// ===== TRANSPORT INTERFACES =====

/**
 * Transport message
 */
export interface TransportMessage {
  type: string;
  targetNodeId: string;
  payload: object;
  meta?: object;
}

/**
 * Transport message handler
 */
export type TransportMessageHandler = (type: string, data: object) => void;

/**
 * Pending store for tracking requests
 */
export interface PendingStore {
  [requestId: string]: {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout?: NodeJS.Timeout;
  };
}

/**
 * Transport configuration options
 */
export interface TransportOptions {
  adapter?: string | object;
  maxQueueSize?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  localNodeUpdateInterval?: number;
  offlineNodeCheckInterval?: number;
  maxOfflineTime?: number;
  maxChunkSize?: number;
  streams?: {
    handleBackpressure?: boolean;
  };
}

/**
 * Transport interface
 */
export interface Transport {
  broker: Broker;
  log: Logger;
  isConnected: boolean;
  isReady: boolean;
  pending: PendingStore;
  adapterName: string;
  
  // Methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  setReady(): Promise<void>;
  send(message: TransportMessage): Promise<void>;
  sendRequest(context: Context): Promise<unknown>;
  request(context: Context): Promise<unknown>;
  response(nodeId: string, action: string, params: object, meta: object, error?: Error): Promise<void>;
  createMessage(nodeId: string, action: string, params: object): TransportMessage;
  removePendingRequestsById(id: string): void;
  removePendingRequestsByNodeId(nodeId: string): void;
  
  // Transport-specific methods
  sendNodeInfo?(): Promise<void>;
  sendPing(nodeId: string): Promise<void>;
  discoverNode?(nodeId: string): Promise<void>;
  discoverNodes?(): Promise<void>;
  sendEvent?(): Promise<void>;
  sendBroadcastEvent?(): Promise<void>;
  
  statistics?: Record<string, unknown>;
}

// ===== CACHE INTERFACES =====

/**
 * Cache configuration options
 */
export interface CacheOptions {
  enabled?: boolean;
  adapter?: string | object;
  ttl?: number;
  lock?: {
    enabled?: boolean;
    ttl?: number;
  };
}

/**
 * Cache interface
 */
export interface Cache {
  name?: string;
  options: CacheOptions;
  log: Logger;
  
  // Methods
  init(): void;
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<any>;
  remove(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getCachingKey(actionName: string, params: any, meta: any): string;
  createMiddleware(): Middleware;
  stop(): Promise<void>;
}

// ===== METRICS INTERFACES =====

/**
 * Metric types
 */
export type MetricType = 'counter' | 'gauge' | 'histogram' | 'info';

/**
 * Base metric interface
 */
export interface BaseMetric {
  name: string;
  type: MetricType;
  description?: string;
  unit?: string;
  labels?: Record<string, string>;
  
  // Methods
  set?(value: number, labels?: Record<string, string>): void;
  increment?(value?: number, labels?: Record<string, string>): void;
  decrement?(value?: number, labels?: Record<string, string>): void;
  observe?(value: number, labels?: Record<string, string>): void;
  reset?(): void;
}

/**
 * Metrics configuration options
 */
export interface MetricsOptions {
  enabled?: boolean;
  adapters?: Array<string | object>;
  collectCommonMetrics?: boolean;
  collectInterval?: number;
  defaultBuckets?: number[];
}

/**
 * Metrics registry interface
 */
export interface MetricRegistry {
  options: MetricsOptions;
  
  // Methods
  init(): void;
  register(metric: BaseMetric): void;
  unregister(name: string): void;
  get(name: string): BaseMetric | undefined;
  list(): BaseMetric[];
  increment(name: string, value?: number, labels?: Record<string, string>): void;
  decrement(name: string, value?: number, labels?: Record<string, string>): void;
  set(name: string, value: number, labels?: Record<string, string>): void;
  observe(name: string, value: number, labels?: Record<string, string>): void;
  stop(): Promise<void>;
}

// ===== TRACING INTERFACES =====

/**
 * Tracing configuration options
 */
export interface TracingOptions {
  enabled?: boolean;
  samplingRate?: number;
  collectors?: Array<string | object>;
  defaultTags?: Record<string, string>;
  errors?: {
    fields?: string[];
    stackTrace?: boolean;
  };
}

/**
 * Tracer interface
 */
export interface Tracer {
  options: TracingOptions;
  
  // Methods
  init(): void;
  startSpan(name: string, parentSpan?: Span): Span;
  finishSpan(span: Span): void;
  stop(): Promise<void>;
}

// ===== MIDDLEWARE INTERFACES =====

/**
 * Action handler wrapper function
 */
export type ActionHandlerWrapper = <T extends Function>(handler: T, action: any) => T;

/**
 * Event handler wrapper function
 */
export type EventHandlerWrapper = <T extends Function>(handler: T, event: any) => T;

/**
 * Method wrapper function
 */
export type MethodWrapper = <T extends Function>(handler: T) => T;

/**
 * Middleware lifecycle hook
 */
export type MiddlewareLifecycleHook = (runtime?: Runtime) => void | Promise<void>;

/**
 * Middleware service lifecycle hook
 */
export type MiddlewareServiceLifecycleHook = (service: Service) => void | Promise<void>;

/**
 * Middleware definition with all available hooks
 */
export interface Middleware {
  name?: string;
  priority?: number;
  
  // Lifecycle hooks
  created?: MiddlewareLifecycleHook;
  started?: MiddlewareLifecycleHook;
  starting?: MiddlewareLifecycleHook;
  stopped?: MiddlewareLifecycleHook;
  stopping?: MiddlewareLifecycleHook;
  serviceChanged?: MiddlewareLifecycleHook;
  // Service lifecycle hooks
  serviceStarted?: MiddlewareServiceLifecycleHook;
  serviceStopping?: MiddlewareServiceLifecycleHook;
  
  // Action handler wrappers
  localAction?: ActionHandlerWrapper;
  remoteAction?: ActionHandlerWrapper;
  
  // Event handler wrappers
  localEvent?: EventHandlerWrapper;
  
  // Method wrappers
  call?: MethodWrapper;
  multiCall?: MethodWrapper;
  emit?: MethodWrapper;
  broadcast?: MethodWrapper;
  broadcastLocal?: MethodWrapper;
  createService?: MethodWrapper;
  loadService?: MethodWrapper;
  loadServices?: MethodWrapper;
  ping?: MethodWrapper;
  
  // Custom hooks
  [key: string]: any;
}

/**
 * Middleware handler manager
 */
export interface MiddlewareHandler {
  add(middleware: Middleware | ((runtime: Runtime) => Middleware)): void;
  count(): number;
  callHandlersSync(hook: string, args: unknown[], reverse?: boolean): void;
  callHandlersAsync(hook: string, args: unknown[], reverse?: boolean): Promise<void>;
  wrapMethod<T extends Function>(method: string, handler: T, bindTo?: any): T;
  wrapHandler<T extends Function>(hook: string, handler: T, definition?: any): T;
}

/**
 * Bulkhead configuration
 */
export interface BulkheadOptions {
  enabled?: boolean;
  concurrentCalls?: number;
  maxQueueSize?: number;
}

/**
 * Circuit breaker configuration
 */
export interface CircuitBreakerOptions {
  enabled?: boolean;
  halfOpenTimeout?: number;
  maxFailures?: number;
  windowTime?: number;
}

/**
 * Retry policy configuration
 */
export interface RetryPolicyOptions {
  enabled?: boolean;
  delay?: number;
  retries?: number;
  factor?: number;
  maxDelay?: number;
}

/**
 * Context tracking configuration
 */
export interface ContextTrackingOptions {
  enabled?: boolean;
  shutdownTimeout?: number;
}

/**
 * Validator configuration
 */
export interface ValidatorOptions {
  strict?: boolean;
  strictMode?: 'remove' | 'error';
}

// ===== CORE INTERFACES =====

/**
 * Service manager interface
 */
export interface ServiceManager {
  services: Map<string, Service>;
  serviceList: Service[];
  
  // Methods
  createService(schema: ServiceSchema): Service;
  registerService(service: Service): void;
  unregisterService(serviceName: string): void;
  startServices(): Promise<void>;
  stopServices(): Promise<void>;
  waitForServices(services: string | string[], timeout?: number): Promise<void>;
  serviceChanged(localService: boolean): void;
}

/**
 * Context factory interface
 */
export interface ContextFactory {
  create(endpoint: Endpoint | null, data: any, options?: ActionOptions): Context;
  createFromService(service: Service, data: any, options?: ActionOptions): Context;
}

/**
 * Event bus interface
 */
export interface EventBus {
  emit(eventName: string, payload?: any, options?: EventOptions): Promise<void>;
  broadcast(eventName: string, payload?: any, options?: EventOptions): Promise<void>;
  broadcastLocal(eventName: string, payload?: any, options?: EventOptions): void;
}

/**
 * Action invoker interface
 */
export interface ActionInvoker {
  call<TParams = any, TResult = any>(actionName: string, params?: TParams, options?: ActionOptions): Promise<TResult>;
  multiCall(calls: Array<{ action: string; params?: any; options?: ActionOptions }>): Promise<any[]>;
}

/**
 * Runtime instance state
 */
export interface RuntimeInstanceState {
  isStarted: boolean;
  instanceId: string;
}

/**
 * Ping result
 */
export interface PingResult {
  nodeId: string;
  time: number;
  [key: string]: any;
}

/**
 * Runtime interface - core system runtime
 */
export interface Runtime {
  nodeId: string;
  version: string;
  options: BrokerOptions;
  bus: EventEmitter;
  state: RuntimeInstanceState;
  
  // Core components
  actionInvoker: ActionInvoker;
  eventBus: EventBus;
  broker?: Broker;
  middlewareHandler: MiddlewareHandler;
  validator?: any;
  services: ServiceManager;
  contextFactory: ContextFactory;
  registry: Registry;
  transport?: Transport;
  cache?: Cache;
  metrics?: MetricRegistry;
  tracer?: Tracer;
  
  // Utilities
  log: Logger;
  createLogger: (topic: string, data?: any) => Logger;
  getUUID?: () => string;
  generateUUID: () => string;
  
  // Error handling
  handleError: (error: Error) => void;
  fatalError: (message?: string, error?: Error, killProcess?: boolean) => void;
}

/**
 * Main broker configuration options
 */
export interface BrokerOptions {
  nodeId?: string;
  namespace?: string;
  
  // Feature options
  bulkhead?: BulkheadOptions;
  cache?: CacheOptions;
  circuitBreaker?: CircuitBreakerOptions;
  contextTracking?: ContextTrackingOptions;
  metrics?: MetricsOptions;
  registry?: RegistryOptions;
  retryPolicy?: RetryPolicyOptions;
  transport?: TransportOptions;
  tracing?: TracingOptions;
  logger?: LoggerOptions | LoggerFactoryFunction;
  
  // Validation
  validateActionParams?: boolean;
  validatorOptions?: ValidatorOptions;
  
  // Middleware
  loadInternalMiddlewares?: boolean;
  middlewares?: Middleware[];
  
  // Lifecycle hooks
  errorHandler?: (error: Error) => void;
  uuidFactory?: (runtime: Runtime) => string;
  waitForServiceInterval?: number;
  beforeRegisterMiddlewares?: () => string;
  
  // Service lifecycle
  created?(this: Broker): void | Promise<void>;
  started?(this: Broker): void | Promise<void>;
  stopped?(this: Broker): void | Promise<void>;
}

export interface ActionContracts {}


/**
 * Main Broker interface - the primary API
 */
export interface Broker {
  nodeId: string;
  namespace?: string;
  runtime: Runtime;
  bus: EventEmitter;
  version: string;
  options: BrokerOptions;
  
  // Core components access
  metrics?: MetricRegistry;
  validator: any;
  contextFactory: ContextFactory;
  registry: Registry;
  cache?: Cache;
  tracer?: Tracer;
  transport?: Transport;
  log: Logger;
  
  // Lifecycle methods
  start(): Promise<void>;
  stop(): Promise<void>;
  
  // Service management
  createService(schema: ServiceSchema): Service;
  loadService(path: string): Service;
  loadServices(path?: string, pattern?: string): number;
  
  // Action calls
  call<K extends keyof ActionContracts>(
    action: K,
    params: K extends keyof ActionContracts ? ActionContracts[K]["params"] : any,
    options?: ActionOptions
  ): Promise<K extends keyof ActionContracts ? ActionContracts[K]["response"] : any>;
  call<K extends string>(
    action: Exclude<K, keyof ActionContracts>,
    params?: any,
    options?: ActionOptions
  ): Promise<any>;
  multiCall(calls: Array<{ action: string; params?: any; options?: ActionOptions }>): Promise<any[]>;
  
  // Events
  emit(eventName: string, payload?: any, options?: EventOptions): Promise<void>;
  broadcast(eventName: string, payload?: any, options?: EventOptions): Promise<void>;
  broadcastLocal(eventName: string, payload?: any, options?: EventOptions): Promise<void>;
  
  // Utilities
  createLogger(topic: string, data?: any): Logger;
  getUUID(): string;
  waitForServices(services: string[] | string, timeout?: number): Promise<void>;
  ping(nodeId?: string, timeout?: number): Promise<PingResult | Record<string, PingResult | null> | null>;
  getNextActionEndpoint(actionName: string, options?: any): Endpoint | Error;
  
  // Error handling
  handleError(error: Error): void;
  fatalError(message?: string, error?: Error, killProcess?: boolean): void;
}

// ===== ERROR CLASSES =====

/**
 * Base Weave error class
 */
export class WeaveError extends Error {
  constructor(message: string, code?: string, type?: string, data?: any);
  code?: string;
  type?: string;
  data?: any;
}

export class WeaveMaxCallLevelError extends WeaveError {}
export class WeaveParameterValidationError extends WeaveError {}
export class WeaveServiceNotFoundError extends WeaveError {}
export class WeaveRequestTimeoutError extends WeaveError {}
export class WeaveRetryableError extends WeaveError {}
export class WeaveActionNotFoundError extends WeaveError {}

// ===== MAIN EXPORTS =====

/**
 * Create a new Weave broker instance
 * @param options - Broker configuration options
 * @returns A new Broker instance
 */
export function createBroker(options?: BrokerOptions): Broker;

/**
 * @deprecated Use createBroker instead
 */
export function Weave(options?: BrokerOptions): Broker;

/**
 * Default broker options
 */
export const defaultOptions: BrokerOptions;

/**
 * Weave constants
 */
export namespace Constants {
  export const INTERNAL_SERVICES: string[];
  export const MIDDLEWARE: {
    BULKHEAD: string;
    CACHE: string;
    CIRCUIT_BREAKER: string;
    CONTEXT_TRACKER: string;
    ERROR_HANDLER: string;
    METRICS: string;
    RETRY: string;
    TIMEOUT: string;
    TRACING: string;
    VALIDATOR: string;
  };
}

/**
 * Available cache adapters
 */
export namespace Cache {
  export function resolve(adapter: string | object): any;
}

/**
 * Available transport adapters
 */
export namespace TransportAdapters {
  export function resolve(adapter: string | object): any;
}

/**
 * Available tracing adapters
 */
export namespace TracingAdapters {
  export function resolve(adapter: string | object): any;
}

/**
 * Helper functions for type-safe service definitions
 */
export function defineService<T extends ServiceSchema>(schema: T): T;
export function defineAction<TParams extends Record<string, ServiceActionParamSchema>>(
  action: ServiceActionSchema<TParams>
): ServiceActionSchema<TParams>;
export function defineBrokerOptions<T extends BrokerOptions>(options: T): T;

/**
 * Weave errors namespace
 */
export namespace Errors {
  export {
    WeaveError,
    WeaveMaxCallLevelError,
    WeaveParameterValidationError, 
    WeaveServiceNotFoundError,
    WeaveRequestTimeoutError,
    WeaveRetryableError,
    WeaveActionNotFoundError
  };
}