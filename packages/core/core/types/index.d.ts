/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 *
 * PUBLIC API TYPES
 *
 * This file contains all types that are part of the public API.
 * For internal types, see ./internal.d.ts
 */

import { Readable, Writable } from "stream";
import { EventEmitter } from "events";

// Re-export internal types that middleware authors and internal code need
export type {
  Runtime,
  RuntimeInstanceState,
  Endpoint,
  ServiceItem,
  ParsedAction,
  ParsedEvent,
  RegistryOptions,
  TransportOptions,
  // Registry types
  Registry,
  Node,
  NodeInfo,
  NodeClient,
  NodeCollection,
  ServiceCollection,
  ActionCollection,
  EventCollection,
  NodeUpdatePayload,
  NodeHeartbeatPayload,
  // Runtime types
  ServiceManager,
  ContextFactory,
  EventBus,
  ActionInvoker,
  PingResult,
  GroupedEndpoint,
  // Transport types
  Transport,
  TransportAdapter,
  TransportMessage,
  TransportMessagePayload,
  TransportMessageHandler,
  PendingStore,
  RequestPayload,
  ResponsePayload,
  EventPayload,
  HeartbeatPayload,
  PingPayload,
  InfoPayload,
  ErrorPayload,
} from "./internal.js";

// ===== UTILITY TYPES =====

/**
 * Log level type definition
 */
export type LogLevel = "verbose" | "debug" | "info" | "warn" | "error" | "fatal" | "silent";

/**
 * Service action visibility levels
 */
export type ServiceActionVisibility = "published" | "public" | "protected" | "private";

/**
 * Type mapping for parameter validation
 */
export interface TypeMap {
  string: string;
  number: number;
  boolean: boolean;
  email: string;
  object: object;
  array: unknown[];
  date: Date;
  uuid: string;
  url: string;
  any: any;
}

/**
 * Utility type to convert parameter schemas to actual types
 */
export type ParamsToType<TParams extends Record<string, { type: keyof TypeMap }>> = {
  [K in keyof TParams]: TypeMap[TParams[K]["type"]];
};

// ===== TRACING TYPES =====

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
  tags?: Record<string, unknown>;
  logs?: Array<{ timestamp: number; fields: Record<string, unknown> }>;

  // Methods
  addTags(tags: Record<string, unknown>): void;
  setError(error: Error): void;
}

export interface SpanOptions {
  id?: string;
  parentSpan?: Span;
  parentId?: string;
  traceId?: string;
  type?: string;
  sampled?: boolean;
  service?: Service | { name: string; version?: string | number; fullyQualifiedName: string };
  tags?: Record<string, unknown>;
  defaultTags?: Record<string, unknown>;
}

// ===== CONTEXT TYPES =====

/**
 * Context metadata object
 */
export interface ContextMetaObject {
  user?: any;
  headers?: Record<string, unknown>;
  timeout?: number;
  retryCount?: number;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Action options for service calls
 */
export interface ActionOptions {
  context?: Context;
  parentContext?: Context;
  meta?: ContextMetaObject;
  stream?: Readable;
  timeout?: number;
  retryCount?: number;
  retries?: number;
  custom?: Record<string, unknown>;
  requestId?: string;
  parentSpan?: Span;
  nodeId?: string;
  track?: boolean;
}

/**
 * Event options for event broadcasting
 */
export interface EventOptions {
  groups?: string[];
  nodeId?: string;
  broadcast?: boolean;
  ack?: boolean;
}

/**
 * Service injection object passed to action/event handlers
 */
export interface ServiceInjection {
  service: Service;
  runtime: import("./internal.js").Runtime;
  errors?: Record<string, unknown>;
}

/**
 * Request context passed to actions and events
 */
export interface Context<T = unknown> {
  id?: string;
  requestId?: string;
  nodeId: string;
  callerNodeId?: string;
  parentContext?: Context;
  parentId?: string;
  endpoint?: import("./internal.js").Endpoint;
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
  stream?: Readable;
  action?: any;
  startHighResolutionTime?: [number, number] | null;
  log?: Logger;

  // Methods
  setData(data: T): void;
  call<TParams = unknown, TResult = unknown>(
    actionName: string,
    params?: TParams,
    options?: ActionOptions,
  ): Promise<TResult>;
  emit(eventName: string, payload?: unknown, options?: EventOptions): Promise<void>;
  broadcast(eventName: string, payload?: unknown, options?: EventOptions): Promise<void>;
  startSpan(name?: string, options?: SpanOptions): Span;
  finishSpan(span?: Span, time?: number): void;
  copy(): Context<T>;
  setStream(stream: Readable): void;
  setEndpoint(endpoint: import("./internal.js").Endpoint): void;
}

// ===== LOGGER TYPES =====

/**
 * Logger instance interface
 */
/** Additional information passed to a log call. */
export type LogMeta = Record<string, unknown> | string | Error;

export interface Logger {
  fatal(message: string | object, meta?: LogMeta): void;
  error(message: string | object, meta?: LogMeta): void;
  warn(message: string | object, meta?: LogMeta): void;
  info(message: string | object, meta?: LogMeta): void;
  debug(message: string | object, meta?: LogMeta): void;
  verbose(message: string | object, meta?: LogMeta): void;

  // Utility methods
  child(bindings: object): Logger;
  level: string;
}

/**
 * Logger options
 */
export interface LoggerOptions {
  enabled?: boolean;
  level?: LogLevel;
  messageKey?: string;
  customLevels?: Record<string, number> | null;
  base?: Record<string, unknown> | null;
  name?: string;
  destination?: Writable;
  colors?: boolean;
  formatter?: "json" | "human" | ((data: any) => string);
}

/**
 * Logger factory bindings
 */
export interface LoggerFactoryBindings {
  nodeId: string;
  moduleName: string;
  [key: string]: unknown;
}

/**
 * Logger factory function type
 */
export type LoggerFactoryFunction = (bindings: LoggerFactoryBindings, level?: LogLevel) => Logger;

// ===== SERVICE TYPES =====

/**
 * Service settings interface
 */
export interface ServiceSettings {
  [key: string]: unknown;
}

/**
 * Service action parameter schema (full object notation)
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
  custom?: (value: any, errors: unknown[]) => boolean;
  properties?: Record<string, ServiceActionParamSchema | keyof TypeMap>;
  items?: ServiceActionParamSchema | keyof TypeMap;
  [key: string]: unknown;
}

/**
 * Service action schema definition
 */
export interface ServiceActionSchema<
  TParams extends Record<string, ServiceActionParamSchema | keyof TypeMap> = Record<
    string,
    ServiceActionParamSchema | keyof TypeMap
  >,
> {
  params?: TParams;
  responseSchema?: ServiceActionParamSchema | keyof TypeMap;
  visibility?: ServiceActionVisibility;
  cache?: boolean | string | ActionCacheOptions;
  timeout?: number;
  retries?: number;
  bulkhead?: BulkheadOptions;
  circuitBreaker?: CircuitBreakerOptions;
  tracing?: boolean | ActionTracingOptions;
  metrics?: boolean | object;
  handler: (
    this: Service,
    context: Context<ParamsToType<TParams>>,
    injection: ServiceInjection,
  ) => Promise<unknown> | unknown;
  [key: string]: unknown;
}

/**
 * Service action handler function
 */
export type ServiceActionHandler = (
  this: Service,
  context: Context,
  injection: ServiceInjection,
) => Promise<unknown> | unknown;

/**
 * Service event handler function (short form)
 */
export type ServiceEventHandler = (
  this: Service,
  context: Context,
  injection: ServiceInjection,
) => Promise<unknown> | unknown;

/**
 * Service event definition (object form)
 */
export interface ServiceEvent {
  group?: string;
  params?: Record<string, ServiceActionParamSchema | keyof TypeMap>;
  tracing?: boolean | EventTracingOptions;
  handler: ServiceEventHandler | ServiceEventHandler[];
  [key: string]: unknown;
}

/**
 * Service event schema - supports both function and object definitions
 */
export type ServiceEventSchema = ServiceEventHandler | ServiceEvent;

/**
 * Service method definition
 */
export type ServiceMethodDefinition = (this: Service, ...args: unknown[]) => any;

/**
 * Hook function types
 */
export type BeforeHookFunction = (
  context: Context,
) => Promise<Context> | Context | void | Promise<void>;
export type AfterHookFunction = (context: Context, response: any) => Promise<unknown> | unknown;
export type ErrorHookFunction = (context: Context, error: Error) => Promise<void> | void;

/**
 * Hook definition types - can be a function, method name string, or array of both
 */
export type BeforeHookDefinition = BeforeHookFunction | string | (BeforeHookFunction | string)[];
export type AfterHookDefinition = AfterHookFunction | string | (AfterHookFunction | string)[];
export type ErrorHookDefinition = ErrorHookFunction | string | (ErrorHookFunction | string)[];

/**
 * Hooks declared on a single action
 */
export interface ActionHooks {
  before?: BeforeHookDefinition;
  after?: AfterHookDefinition;
  error?: ErrorHookDefinition;
}

/**
 * Service lifecycle hooks
 */
export interface ServiceHooks {
  before?: {
    [actionName: string]: BeforeHookDefinition;
  };
  after?: {
    [actionName: string]: AfterHookDefinition;
  };
  error?: {
    [actionName: string]: ErrorHookDefinition;
  };
}

/**
 * Service lifecycle hook types
 */
export type ServiceLifecycleHook = (
  this: Service,
  injection?: ServiceInjection,
) => void | Promise<void>;
export type ServiceAfterSchemasMergedHook = (
  this: Service,
  schema?: ServiceSchema,
  injection?: ServiceInjection,
) => void | Promise<void>;

/**
 * Service schema definition
 */
export interface ServiceSchema {
  name: string;
  version?: string | number;
  dependencies?: string[];
  mixins?: Partial<ServiceSchema>[] | Partial<ServiceSchema>;
  settings?: ServiceSettings;
  meta?: Record<string, unknown>;
  hooks?: ServiceHooks;
  actions?: Record<string, ServiceActionSchema | ServiceActionHandler | boolean>;
  events?: Record<string, ServiceEventSchema>;
  methods?: Record<string, ServiceMethodDefinition>;
  /** Whether this service is critical - if true, failure to start will prevent broker startup */
  critical?: boolean;

  // Lifecycle methods (can be single function or array of functions)
  created?: ServiceLifecycleHook | ServiceLifecycleHook[];
  started?: ServiceLifecycleHook | ServiceLifecycleHook[];
  stopped?: ServiceLifecycleHook | ServiceLifecycleHook[];
  afterSchemasMerged?: ServiceAfterSchemasMergedHook | ServiceAfterSchemasMergedHook[];
}

/**
 * Service instance interface
 */
export interface Service {
  filename?: string;
  runtime: import("./internal.js").Runtime;
  broker: Broker;
  log: Logger;
  version?: string | number;
  name: string;
  meta?: Record<string, unknown>;
  fullyQualifiedName: string;
  schema: ServiceSchema;
  settings: ServiceSettings;
  actions: Record<string, (data: object, options?: ActionOptions) => any>;
  events: Record<string, (data: object, options?: ActionOptions) => any>;
  methods: Record<string, Function>;
  _trackedContexts: Context[];

  // Lifecycle methods
  start(): Promise<void>;
  stop(): Promise<void>;

  // Dynamic methods added via schema.methods
  [key: string]: unknown;
}

// ===== CACHE TYPES =====

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
    staleTime?: number;
  };
}

/**
 * Action-level cache options
 */
export interface ActionCacheOptions {
  keys?: string[];
  ttl?: number;
  condition?: (context: Context) => boolean;
}

/**
 * Cache interface
 */
export interface Cache {
  name?: string;
  options: CacheOptions;
  log: Logger;
  isConnected: boolean;

  // Methods
  init(): void;
  set(key: string, value: any, ttl?: number): Promise<void>;
  get(key: string): Promise<unknown>;
  getWithTTl?(key: string): Promise<{ data: any; ttl: number } | null>;
  remove(key: string): Promise<boolean>;
  clear(): Promise<void>;
  getCachingKey(actionName: string, params: any, meta: any, keys?: string[]): string;
  lock(key: string): Promise<() => Promise<void>>;
  createMiddleware(): Middleware;
  stop(): Promise<void>;
}

// ===== METRICS TYPES =====

/**
 * Metric types
 */
export type MetricType = "counter" | "gauge" | "histogram" | "info";

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
  getMetric(name: string): BaseMetric | undefined;
  list(): BaseMetric[];
  increment(
    name: string,
    labels?: Record<string, unknown> | null,
    value?: number,
    timestamp?: number,
  ): void;
  decrement(
    name: string,
    labels?: Record<string, unknown> | null,
    value?: number,
    timestamp?: number,
  ): void;
  set(
    name: string,
    value: number,
    labels?: Record<string, unknown> | null,
    timestamp?: number,
  ): void;
  observe(name: string, value: number, labels?: Record<string, unknown>): void;
  timer(name: string, labels?: Record<string, unknown> | null, timestamp?: number): () => number;
  stop(): Promise<void>;
}

// ===== TRACING OPTIONS =====

/**
 * Tracing configuration options
 */
export interface TracingTagsOptions {
  data?: boolean | string[];
  meta?: boolean | string[];
  response?: boolean | string[];
  tags?: Record<string, unknown> | ((context: Context) => Record<string, unknown>);
}

export interface ActionTracingOptions extends TracingTagsOptions {
  enabled?: boolean;
  spanName?: string | ((context: Context) => string);
}

export interface EventTracingOptions extends TracingTagsOptions {
  enabled?: boolean;
}

export interface TracingOptions {
  enabled?: boolean;
  samplingRate?: number;
  collectors?: Array<string | object>;
  defaultTags?: Record<string, string>;
  actions?: TracingTagsOptions;
  events?: EventTracingOptions;
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
  startSpan(name: string, options?: SpanOptions): Span;
  finishSpan(span: Span): void;
  stop(): Promise<void>;
}

// ===== MIDDLEWARE TYPES =====

/**
 * Action handler function type
 */
export type ActionHandler = (context: Context, injection: ServiceInjection) => Promise<unknown>;

/**
 * Event handler function type
 */
export type EventHandler = (context: Context, injection: ServiceInjection) => Promise<unknown>;

/**
 * Action handler wrapper function
 */
export type ActionHandlerWrapper = (
  handler: ActionHandler,
  action: import("./internal.js").ParsedAction,
) => ActionHandler;

/**
 * Event handler wrapper function
 */
export type EventHandlerWrapper = (
  handler: EventHandler,
  event: import("./internal.js").ParsedEvent,
) => EventHandler;

/**
 * Method wrapper function
 */
export type MethodWrapper<TArgs extends unknown[] = unknown[], TResult = unknown> = (
  handler: (...args: TArgs) => TResult,
) => (...args: TArgs) => TResult;

/**
 * Middleware lifecycle hook
 */
export type MiddlewareLifecycleHook = (
  runtime?: import("./internal.js").Runtime,
) => void | Promise<void>;

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
  call?: MethodWrapper<[string, unknown, ActionOptions | undefined], Promise<unknown>>;
  multiCall?: MethodWrapper;
  emit?: MethodWrapper<[string, unknown], void>;
  broadcast?: MethodWrapper<[string, unknown], void>;
  broadcastLocal?: MethodWrapper<[string, unknown], void>;
  createService?: MethodWrapper;
  loadService?: MethodWrapper;
  loadServices?: MethodWrapper;
  ping?: MethodWrapper;

  // Custom hooks
  [key: string]: unknown;
}

/**
 * Middleware handler manager
 */
export interface MiddlewareHandler {
  add(middleware: Middleware | ((runtime: import("./internal.js").Runtime) => Middleware)): void;
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
  failureOnError?: boolean;
  failureOnTimeout?: boolean;
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
  strictMode?: "remove" | "error";
}

// ===== BROKER TYPES =====

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
  registry?: import("./internal.js").RegistryOptions;
  retryPolicy?: RetryPolicyOptions;
  transport?: import("./internal.js").TransportOptions;
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
  uuidFactory?: (runtime: import("./internal.js").Runtime) => string;
  waitForServiceInterval?: number;
  beforeRegisterMiddlewares?: () => string;

  // Service lifecycle
  created?(this: Broker): void | Promise<void>;
  started?(this: Broker): void | Promise<void>;
  stopped?(this: Broker): void | Promise<void>;
}

/**
 * Action contracts for type-safe calls (augment this interface)
 */
export interface ActionContracts {}

/**
 * Event contracts for type-safe events (augment this interface)
 */
export interface EventContracts {}

/**
 * Main Broker interface - the primary API
 */
export interface Broker {
  nodeId: string;
  namespace?: string;
  runtime: import("./internal.js").Runtime;
  bus: EventEmitter;
  version: string;
  options: BrokerOptions;

  // Core components access
  metrics?: MetricRegistry;
  validator: any;
  contextFactory: import("./internal.js").ContextFactory;
  registry: import("./internal.js").Registry;
  cache?: Cache;
  tracer?: Tracer;
  transport?: import("./internal.js").Transport;
  log: Logger;

  // Lifecycle methods
  start(): Promise<void>;
  stop(): Promise<void>;

  // Service management
  createService(schema: ServiceSchema): Service | undefined;
  loadService(path: string): Service | undefined;
  loadServices(path?: string, pattern?: string): number;

  // Action calls
  call<K extends keyof ActionContracts>(
    action: K,
    params: ActionContracts[K]["params"],
    options?: ActionOptions,
  ): Promise<ActionContracts[K]["response"]>;
  /**
   * Calls an action that has no generated contract. Pass the expected response
   * type as `TResult` - it cannot be derived from the action name.
   */
  call<TResult = unknown, K extends string = string>(
    action: Exclude<K, keyof ActionContracts>,
    params?: unknown,
    options?: ActionOptions,
  ): Promise<TResult>;
  multiCall<TResult = unknown>(
    calls: Array<{ action: string; params?: unknown; options?: ActionOptions }>,
  ): Promise<TResult[]>;

  // Events
  emit<K extends keyof EventContracts>(
    eventName: K,
    payload?: K extends keyof EventContracts ? EventContracts[K]["params"] : any,
    options?: EventOptions,
  ): Promise<void>;
  emit<K extends string>(
    eventName: Exclude<K, keyof EventContracts>,
    payload?: any,
    options?: EventOptions,
  ): Promise<void>;
  broadcast(eventName: string, payload?: any, options?: EventOptions): Promise<void>;
  broadcastLocal(eventName: string, payload?: any, options?: EventOptions): Promise<void>;

  // Utilities
  createLogger(topic: string, data?: any): Logger;
  getUUID(): string;
  waitForServices(services: string[] | string, timeout?: number): Promise<void>;
  /** Pings one node and resolves with its result, or null on timeout. */
  ping(nodeId: string, timeout?: number): Promise<import("./internal.js").PingResult | null>;
  /** Pings all known nodes and resolves with one entry per node. */
  ping(
    nodeId?: undefined,
    timeout?: number,
  ): Promise<Record<string, import("./internal.js").PingResult | null> | null>;
  getNextActionEndpoint(
    actionName: string,
    options?: any,
  ): import("./internal.js").Endpoint | Error;

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
export class ParsedActionNotFoundError extends WeaveError {}

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
  export function resolve(adapter: string | object): TransportAdapter;
  /** Creates an adapter from a transport URI such as `tcp://localhost:5000`. */
  export function fromURI(uri: string, errorHandler?: (error: unknown) => void): TransportAdapter;
  export function Dummy(options?: object): TransportAdapter;
  export function TCP(options?: object): TransportAdapter;
  export const BaseAdapter: TransportAdapter;
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
  action: ServiceActionSchema<TParams>,
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
    ParsedActionNotFoundError,
  };
}
