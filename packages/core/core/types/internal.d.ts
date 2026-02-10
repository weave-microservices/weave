/*
 * Author: Kevin Ries (kevin.ries@fachwerk.io)
 * -----
 * Copyright 2021 Fachwerk
 *
 * INTERNAL TYPES - Not part of the public API
 *
 * These types are used internally by Weave and should not be
 * relied upon by library consumers. They may change without notice.
 */

import { EventEmitter } from "events";
import type {
  ActionCacheOptions,
  ActionOptions,
  ActionTracingOptions,
  Broker,
  BrokerOptions,
  BulkheadOptions,
  Cache,
  CircuitBreakerOptions,
  Context,
  ContextMetaObject,
  EventOptions,
  EventTracingOptions,
  Logger,
  MetricRegistry,
  MiddlewareHandler,
  Service,
  ServiceActionParamSchema,
  ServiceActionVisibility,
  ServiceInjection,
  ServiceSchema,
  ServiceSettings,
  Tracer,
  TypeMap,
} from "./index.js";

// ===== NODE TYPES =====

/**
 * Node information
 * @internal
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
 * @internal
 */
export interface NodeClient {
  type: string | null;
  version: string | null;
  [key: string]: unknown;
}

/**
 * Node update payload
 * @internal
 */
export interface NodeUpdatePayload {
  sequence?: number;
  services?: ServiceItem[];
  events?: string[];
  client?: NodeClient;
  IPList?: string[];
  [key: string]: unknown;
}

/**
 * Node heartbeat payload
 * @internal
 */
export interface NodeHeartbeatPayload {
  cpu?: number | null;
  cpuSequence?: number;
}

/**
 * Node in the registry
 * @internal
 */
export interface Node {
  id: string;
  info: NodeInfo | null;
  isLocal: boolean;
  client: NodeClient;
  cpu: number | null;
  cpuSequence: number | null;
  lastHeartbeatTime: number;
  offlineTime: number | null;
  isAvailable: boolean;
  isUnexpectedDisconnected: boolean;
  services: ServiceItem[];
  sequence: number;
  events: string[] | null;
  IPList: string[];
  port?: number;
  hostname?: string;

  // Methods
  update(payload: NodeUpdatePayload, isReconnected?: boolean): boolean;
  updateLocalInfo(): void;
  heartbeat(payload: NodeHeartbeatPayload): void;
  disconnected(isUnexpected?: boolean): void;
}

// ===== SERVICE ITEM TYPES =====

/**
 * Service item in registry (internal representation)
 * @internal
 */
export interface ServiceItem {
  name: string;
  version?: string | number;
  fullName?: string;
  nodeId?: string;
  node?: Node;
  actions?: Record<string, ParsedAction>;
  events?: Record<string, ParsedEvent>;
  settings?: ServiceSettings;
  metadata?: object;
  isLocal?: boolean;

  // Methods
  update(service: ServiceItem): void;
  addAction(action: ParsedAction): void;
  addEvent(event: ParsedEvent): void;
  equals(name: string, version?: string | number, nodeId?: string): boolean;
}

// ===== ENDPOINT TYPES =====

/**
 * Service action endpoint
 * @internal
 */
export interface Endpoint {
  node: Node;
  service: ServiceItem;
  action: ParsedAction;
  isLocal: boolean;
  state: boolean;
  name: string;

  // Methods
  updateAction(newAction: ParsedAction): void;
  isAvailable(): boolean;
}

// ===== COLLECTION TYPES =====

/**
 * @internal
 */
export interface NodeCollection {
  localNode: Node;
  get(nodeId: string): Node | undefined;
  add(nodeId: string, node: Node): void;
  remove(nodeId: string): void;
  list(params?: any): Node[];
  toArray(): Node[];
  createNode(nodeId: string): Node;
  disconnected(nodeId: string, isUnexpected?: boolean): void;
}

/**
 * @internal
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
 * Internal action representation after parsing
 * @internal
 */
export interface ParsedAction {
  /** Full action name including service name and version prefix */
  name: string;
  /** Short action name without service prefix */
  shortName: string;
  /** Reference to the owning service */
  service: Service;
  /** Service version if applicable */
  version?: string | number;
  /** The promisified and bound action handler */
  handler: (context: Context, injection: ServiceInjection) => Promise<unknown>;
  /** Logger instance for this action */
  log: Logger;
  /** Parameter validation schema */
  params?: Record<string, ServiceActionParamSchema | keyof TypeMap>;
  /** Response validation schema */
  responseSchema?: ServiceActionParamSchema | keyof TypeMap;
  /** Action visibility level */
  visibility?: ServiceActionVisibility;
  /** Cache configuration */
  cache?: boolean | string | ActionCacheOptions;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Number of retries on failure */
  retries?: number;
  /** Bulkhead configuration */
  bulkhead?: BulkheadOptions;
  /** Circuit breaker configuration */
  circuitBreaker?: CircuitBreakerOptions;
  /** Tracing configuration */
  tracing?: boolean | ActionTracingOptions;
  /** Metrics configuration */
  metrics?: boolean | object;
  /** Allow additional properties from schema */
  [key: string]: unknown;
}

/**
 * Internal event representation after parsing
 * @internal
 */
export interface ParsedEvent {
  /** Event name */
  name: string;
  /** Reference to the owning service */
  service: Service;
  /** The promisified and bound event handler(s) */
  handler: (context: Context, injection?: ServiceInjection) => Promise<unknown>;
  /** Logger instance for this event */
  log: Logger;
  /** Event group for load balancing */
  group?: string;
  /** Parameter validation schema */
  params?: Record<string, ServiceActionParamSchema | keyof TypeMap>;
  /** Tracing configuration */
  tracing?: boolean | EventTracingOptions;
  /** Allow additional properties from schema */
  [key: string]: unknown;
}

/**
 * @internal
 */
export interface ActionCollection {
  get(actionName: string): any;
  add(node: Node, service: ServiceItem, action: ParsedAction): void;
  remove(actionName: string, node: Node): void;
  removeByService(service: ServiceItem): void;
  list(): ParsedAction[];
}

/**
 * @internal
 */
export interface EventCollection {
  get(eventName: string): any;
  add(node: Node, service: ServiceItem, event: ParsedEvent): void;
  remove(eventName: string, node: Node): void;
  removeByService(service: ServiceItem): void;
  list(): ParsedEvent[];
  getBalancedEndpoints(eventName: string, groups?: string[]): [Endpoint | null, string][];
  getAllEndpointsUniqueNodes(eventName: string, groups?: string[]): Endpoint[];
  emitLocal(context: Context): Promise<void>;
}

// ===== REGISTRY TYPES =====

/**
 * Registry configuration options
 * @internal
 */
export interface RegistryOptions {
  preferLocalActions?: boolean;
  publishNodeService?: boolean;
  requestTimeout?: number;
  maxCallLevel?: number;
  loadBalancingStrategy?: string | object;
}

/**
 * Registry interface
 * @internal
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

// ===== TRANSPORT MESSAGE TYPES =====

/**
 * @internal
 */
export interface TransportMessagePayload {
  sender?: string;
  [key: string]: any;
}

/**
 * @internal
 */
export interface RequestPayload extends TransportMessagePayload {
  id: string;
  action: string;
  data: any;
  timeout?: number;
  meta?: ContextMetaObject;
  level: number;
  metrics?: any;
  requestId?: string;
  parentId?: string;
  callerNodeId?: string;
  tracing: boolean;
  isStream: boolean;
  sequence?: number;
  chunk?: any;
  success?: boolean;
  error?: any;
}

/**
 * @internal
 */
export interface ResponsePayload extends TransportMessagePayload {
  id: string;
  meta?: ContextMetaObject;
  data: any;
  success: boolean;
  error?: any;
  isStream?: boolean;
  sequence?: number;
  chunk?: any;
}

/**
 * @internal
 */
export interface EventPayload extends TransportMessagePayload {
  data: any;
  eventName: string;
  groups?: string[];
  meta?: ContextMetaObject;
  level?: number;
  metrics?: any;
  requestId?: string;
  parentId?: string;
  callerNodeId?: string;
  tracing?: boolean;
  isBroadcast: boolean;
}

/**
 * @internal
 */
export interface HeartbeatPayload extends TransportMessagePayload {
  cpu?: number;
  cpuSequence?: number;
  sequence: number;
}

/**
 * @internal
 */
export interface PingPayload extends TransportMessagePayload {
  dispatchTime: number;
}

/**
 * @internal
 */
export interface InfoPayload extends TransportMessagePayload, NodeInfo {
  instanceId: string;
}

/**
 * @internal
 */
export interface ErrorPayload {
  name: string;
  message: string;
  nodeId: string;
  code: number;
  stack?: string;
  data: any;
}

/**
 * @internal
 */
export interface TransportMessage<T extends TransportMessagePayload = TransportMessagePayload> {
  type: string;
  targetNodeId?: string;
  payload: T;
  meta?: object;
}

/**
 * @internal
 */
export type TransportMessageHandler = (type: string, data: TransportMessage | null) => boolean;

/**
 * @internal
 */
export interface TransportAdapter {
  name: string;
  bus: EventEmitter;
  broker?: Runtime | Broker;
  transport?: Transport;
  log?: Logger;
  messageHandler?: any;
  isConnected: boolean;
  interruptCounter: number;
  repeatAttemptCounter: number;
  afterInit?: () => void | Promise<void>;

  // Core methods
  init(runtime: Runtime | Broker, transport: Transport, messageHandler?: any): Promise<void>;
  connect(isTryReconnect: boolean, errorHandler: (error: Error) => void): Promise<void>;
  close(): Promise<void>;
  subscribe(messageType: string, nodeId?: string): Promise<void>;
  send(message: TransportMessage): Promise<void>;
  preSend(message: TransportMessage): Promise<void>;

  // Message handling
  incomingMessage(messageType: string, message: any): void;
  serialize(packet: TransportMessage): Buffer;
  deserialize(packet: Buffer | string): TransportMessage;

  // Utility methods
  connected(connectionEventParams?: {
    wasReconnect?: boolean;
    useHeartbeatTimer?: boolean;
    useRemoteNodeCheckTimer?: boolean;
    useOfflineCheckTimer?: boolean;
  }): void;
  disconnected(): void;
  getTopic(cmd: string, nodeId?: string): string;
  updateStatisticReceived(length: number): void;
  updateStatisticSent(length: number): void;
}

/**
 * @internal
 */
export interface PendingStore {
  [requestId: string]: {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timeout?: NodeJS.Timeout;
  };
}

/**
 * @internal
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
  reconnectDisabled?: boolean;
  streams?: {
    handleBackpressure?: boolean;
  };
}

/**
 * @internal
 */
export interface Transport {
  broker: Broker;
  log: Logger;
  isConnected: boolean;
  isReady: boolean;
  pending: any;
  adapterName: string;

  // Methods
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  setReady(): Promise<void>;
  send(message: TransportMessage): Promise<void>;
  sendRequest(context: Context): Promise<unknown>;
  request(context: Context): Promise<unknown>;
  response(
    nodeId: string,
    action: string,
    params: object,
    meta: object,
    error?: Error,
  ): Promise<void>;
  sendResponse(
    nodeId: string,
    id: string,
    data: any,
    meta: object,
    error?: Error | null,
  ): Promise<void>;
  createMessage(nodeId: string, action: string, params: object): TransportMessage;
  removePendingRequestsById(id: string): void;
  removePendingRequestsByNodeId(nodeId: string): void;

  // Transport-specific methods
  sendNodeInfo?(targetNodeId?: string): Promise<void>;
  sendPing(nodeId: string): Promise<void>;
  discoverNode?(nodeId: string): Promise<void>;
  discoverNodes?(): Promise<void>;
  sendEvent?(context: Context): Promise<void>;
  sendBroadcastEvent?(context: Context): Promise<void>;

  statistics?: Record<string, unknown>;
}

// ===== RUNTIME TYPES =====

/**
 * Runtime instance state
 * @internal
 */
export interface RuntimeInstanceState {
  isStarted: boolean;
  instanceId: string;
  trackedContexts: Context[];
}

/**
 * Service manager interface
 * @internal
 */
export interface ServiceManager {
  services?: Map<string, Service>;
  serviceList: Service[];

  // Methods
  createService(schema: ServiceSchema): Service | undefined;
  registerService?(service: Service): void;
  unregisterService?(serviceName: string): void;
  startServices?(): Promise<void>;
  stopServices?(): Promise<void>;
  waitForServices(services: string | string[], timeout?: number, interval?: number): Promise<void>;
  serviceChanged(localService?: boolean): void;
  destroyService(service: Service): Promise<void>;
}

/**
 * Context factory interface
 * @internal
 */
export interface ContextFactory {
  create(endpoint: Endpoint | null, data: any, options?: ActionOptions): Context;
  createFromService(service: Service, data: any, options?: ActionOptions): Context;
}

/**
 * Event bus interface
 * @internal
 */
export interface EventBus {
  emit(eventName: string, payload?: any, options?: EventOptions): Promise<void>;
  broadcast(eventName: string, payload?: any, options?: EventOptions): Promise<void>;
  broadcastLocal(eventName: string, payload?: any, options?: EventOptions): void;
}

/**
 * Action invoker interface
 * @internal
 */
export interface ActionInvoker {
  call<TParams = any, TResult = any>(
    actionName: string,
    params?: TParams,
    options?: ActionOptions,
  ): Promise<TResult>;
  multiCall(
    calls: Array<{ action: string; params?: any; options?: ActionOptions }>,
  ): Promise<any[]>;
}

/**
 * Ping result
 * @internal
 */
export interface PingResult {
  nodeId: string;
  time: number;
  [key: string]: any;
}

/**
 * Runtime interface - core system runtime
 * @internal - but re-exported for middleware authors
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

  // Action invocation
  call<TParams = unknown, TResult = unknown>(
    actionName: string,
    params?: TParams,
    options?: ActionOptions,
  ): Promise<TResult>;
}

// ===== EVENTBUS INTERNAL TYPES =====

/**
 * Grouped endpoint for event emission
 * @internal
 */
export interface GroupedEndpoint {
  endpoint: Endpoint;
  group: string;
}
