declare module '@weave-js/core' {
  type Stream = import('stream').Stream;
  type WritableStream = import('stream').Writable;
  type EventEmitter = import(eve)

  export type ActionOptions = {
    context?: Context;
    parentContext?: Context;
    meta?: object;
    stream?: Stream;
    timeout?: number;
    retryCount?: number;
    custom?: Record<string, any>;
    requestId?: string,
    parentSpan?: Span,
  };
  
  type CallActionFunctionDef = (actionName: string, data?: object, options?: ActionOptions) => Promise<any>;
  
  type ServiceChangedDelegate = (isLocalService?: boolean) => Promise<any>;
  
  type EventOptions = {
    groups?: Array<string>;
    nodeId?: string;
  };
  
  type EventBus = {
    emit: (eventName: string, payload?: object, options?: EventOptions) => Promise<any>;
    broadcast: (eventName: string, payload: any, options?: EventOptions) => Promise<any>;
    broadcastLocal: (eventName: string, payload: any, options?: EventOptions) => Promise<any>;
  };
  
  type Services = {
    serviceChanged: ServiceChangedDelegate;
  };
  
  type ActionInvoker = {
    call: (actionName: string, data: object, options: ActionOptions) => Promise<any>;
    multiCall: (actionName: string, data: object, options: ActionOptions) => Promise<any>;
  };
  
  type RuntimeInstanceState = {
    isStarted: boolean;
    instanceId: string;
  };
  
  type Runtime = {
    nodeId: string;
    version: string;
    actionInvoker: ActionInvoker;
    eventBus?: EventBus;
    bus: EventEmitter;
    broker?: Broker;
    options: BrokerOptions;
    state: RuntimeInstanceState;
    metrics?: MetricRegistry;
    middlewareHandler?: MiddlewareHandler;
    validator?: Validator;
    services?: ServiceManager;
    contextFactory?: ContextFactory;
    log: Logger;
    createLogger?: (topic: string, data: any) => Logger;
    cache?: Cache;
    getUUID?: () => string;
    registry: Registry;
    tracer?: Tracer;
    transport?: Transport;
    handleError: (error: Error) => void;
    fatalError: () => void;
    generateUUID: () => string;
  };
  
  type Broker = {
    nodeId: string;
    namespace?: string;
    runtime: Runtime;
    bus: EventEmitter;
    version: string;
    options: BrokerOptions;
    metrics?: MetricRegistry;
    validator: Validator;
    start: () => Promise<any>;
    stop: () => Promise<any>;
    createService: (serviceSchema: ServiceSchema) => Service;
    loadService: (path: string) => void;
    loadServices: (path?: string, pattern?: string) => void;
    contextFactory: ContextFactory;
    log: Logger;
    createLogger: (topic: string, data: any) => Logger;
    cache?: Cache;
    getUUID: () => string;
    registry: Registry;
    tracer?: Tracer;
    transport?: Transport;
    getNextActionEndpoint: (actionName: string) => Endpoint | Error;
    call: CallActionFunctionDef;
    multiCall: () => Promise<Array<any>>;
    emit: (eventName: string, payload: any, options?: any) => Promise<any>;
    broadcast: (eventName: string, payload: any, options?: any) => Promise<any>;
    broadcastLocal: (eventName: string, payload: any, options?: any) => Promise<any>;
    waitForServices: (services: Array<string> | string) => Promise<any>;
    ping: (nodeId: string, timeout?: number) => Promise<PingResult>;
    handleError: (error: Error) => void;
    fatalError: () => void;
  };
  
  type PingResult = Record<string, number>;
  
  type BulkheadOptions = {
    enabled: boolean;
    concurrentCalls: number;
    maxQueueSize: number;
  };
  
  type MetricsOptions = {
    enabled: boolean;
    adapters: Array<string | object>;
    collectCommonMetrics: boolean;
    collectInterval: number;
    defaultBuckets: Array<number>;
  };
  
  type TracingErrorOptions = {
    fields: Array<string>;
    stackTrace: boolean;
  };
  
  type TracingOptions = {
    enabled: boolean;
    samplingRate: number;
    collectors: Array<string | object>;
    defaultTags: Record<string, string>;
    errors?: TracingErrorOptions;
  };
  
  type CacheLockOptions = {
    enabled: boolean;
  };
  
  type CacheOptions = {
    enabled: boolean;
    adapter: string | object;
    ttl?: number;
    lock?: CacheLockOptions;
  };
  
  type CircuitBreakerOptions = {
    enabled: boolean;
    halfOpenTimeout: number;
    maxFailures: number;
    windowTime: number;
  };
  
  type RetryPolicyOptions = {
    enabled: boolean;
    delay: number;
    retries: number;
  };
  
  type TransportStreamOptions = {
    handleBackpressure: boolean;
  };
  
  type TransportOptions = {
    adapter: string | object;
    maxQueueSize: number;
    heartbeatInterval: number;
    heartbeatTimeout: number;
    localNodeUpdateInterval: number;
    offlineNodeCheckInterval: number;
    maxOfflineTime: number;
    maxChunkSize: number;
    streams: TransportStreamOptions;
  };
  
  type LogLevels = 'verbose' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  
  type LoggerOptions = {
    enabled: boolean;
    level: LogLevels;
    messageKey?: string;
    customLevels?: Record<string, number>;
    base?: Record<string, any>;
    destination?: WritableStream;
  };
  
  type LoggerFactoryBindings = {
    nodeId: string,
    moduleName: string
  }
  
  type LoggerFactoryFunction = (bindings: LoggerFactoryBindings, level: LogLevels) => {}
  
  type ContextTracking = {
    enabled: boolean;
    shutdownTimeout: number;
  };
  
  type ValidatorOptions = {
    strict: boolean;
    strictMode: 'remove' | 'error';
  };
  
  type BrokerOptions = {
    nodeId?: string;
    bulkhead?: BulkheadOptions;
    cache?: CacheOptions;
    contextTracking?: ContextTracking;
    circuitBreaker?: CircuitBreakerOptions;
    transport?: TransportOptions;
    errorHandler?: Function;
    loadInternalMiddlewares?: boolean;
    metrics?: MetricsOptions;
    middlewares?: Array<Middleware>;
    logger?: LoggerOptions | LoggerFactoryFunction;
    tracing?: TracingOptions;
    namespace?: string;
    registry?: RegistryOptions;
    retryPolicy?: RetryPolicyOptions;
    validatorOptions?: ValidatorOptions;
    validateActionParams?: boolean;
    waitForServiceInterval?: number;
    beforeRegisterMiddlewares?: () => string;
    uuidFactory?: (runtime: Runtime) => string;
    started?: () => void;
    stopped?: () => void;
  };
  
  type RegistryOptions = {
    preferLocalActions: boolean;
    publishNodeService: boolean;
    requestTimeout: number;
    maxCallLevel: number;
    loadBalancingStrategy: string | object;
  };
  
  type ServiceActionParamSchema = { [key: string]: any };
  type ServiceActionParamTypes<T> =
    | 'any'
    | 'array'
    | 'boolean'
    | 'custom'
    | 'date'
    | 'email'
    | 'enum'
    | 'forbidden'
    | 'function'
    | 'number'
    | 'object'
    | 'string'
    | 'url'
    | 'uuid'
    | boolean
    | string
    | ServiceActionParamSchema;
	type ServiceActionParams = { [key: string]: ServiceActionParamTypes<T> };

  type ObjectType = TypeMap

  type TypeMap = {
    string: string;
    number: number;
    boolean: boolean;
    email: string;
    object: object;
  };

  type ParamsToType<TParams extends { [key: string]: { type: keyof TypeMap } }> = {
    [K in keyof TParams]: TypeMap[TParams[K]['type']];
  };
  
  type InferParams<T> = {
    [K in keyof T]: InferPropertyType<T[K]>;
  };
  type ServiceActionVisibility = 'published' | 'public' | 'protected' | 'private';

  type ServiceActionSchema<T extends { [key: string]: { type: keyof TypeMap } }> = {
    params?: T;
    visibility?: ServiceActionVisibility,
    handler: (this: Service, context: Context<ParamsToType<T>>) => Promise<any> | any;
    [key: string]: any;
  };
  
  type ServiceActionDefinition = {
    name: string
  }
  
  type ServiceActionHandler = (this: Service, context: Context) => Promise<any>;
    
  type ServiceEvent = {
    name: string;
    handler: (this: Service, context: Context) => Promise<any>;
  };
  
  type ServiceMethodDefinition = (this: Service, context: Context) => Promise<any>;
  
  type ServiceSchema = {
    name: string;
    dependencies?: Array<string>;
    version?: number;
    mixins?: Array<ServiceSchema> | ServiceSchema;
    settings?: ServiceSettings;
    meta?: Record<string, any>;
    hooks?: { [key: string]: Function };
    actions?: { [key: string]: ServiceActionSchema | ServiceActionHandler | boolean };
    events?: { [key: string]: ServiceEvent };
    methods?: { [key: string]: ServiceMethodDefinition };
    created?: () => void;
    started?: () => void;
    stopped?: () => void;
    afterSchemasMerged?: (() => void) | Array<() => void>;
  };
  
  type Span = {
    id: string;
    sampled: boolean;
  }
  
  type Context<T> = {
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
    span: Span;
    isCachedResult?: boolean;
    eventType?: string;
    eventName?: string;
    eventGroups?: Array<string>;
    options: ActionOptions;
    duration: number;
    stopTime: number;
    metrics?: any;
    setData: (data: any) => void;
    call: CallActionFunctionDef;
    emit: (eventName: string, payload: object) => Promise<any>;
    stream?: Stream;
    broadcast: (eventName: string, payload: any) => Promise<any>;
    startSpan: () => void;
    finishSpan: () => void;
    copy: () => Context;
    setStream: (stream: Stream) => void;
    setEndpoint: (endpoint: Endpoint) => void;
  };
  
  type Cache = {
    name?: string;
    options: any;
    init: () => void;
    log: Logger;
    set: (key: string, value: any) => Promise<any>;
    get: (key: string) => Promise<any>;
    remove: (key: string) => Promise<any>;
    clear: () => Promise<any>;
    getCachingKey: () => string;
    createMiddleware: () => Middleware;
    stop: () => Promise<any>;
  };
  
  type Transport = {
    broker: Broker;
    log: Logger;
    isConnected: boolean;
    isReady: boolean;
    pending: PendingStore;
    resolveConnect: () => void;
    adapterName: string;
    connect: () => Promise<any>;
    disconnect: () => Promise<any>;
    setReady: () => Promise<any>;
    send: (message: TransportMessage) => Promise<any>;
    sendNodeInfo: any;
    sendPing: () => Promise<any>;
    discoverNode: (nodeId: string) => Promise<any>;
    discoverNodes: () => Promise<any>;
    sendEvent: () => Promise<any>;
    sendBroadcastEvent: () => Promise<any>;
    removePendingRequestsById: (id: string) => void;
    removePendingRequestsByNodeId: (nodeId: string) => void;
    createMessage: (nodeId: string, action: string, params: object) => TransportMessage;
    request: (context: Context) => Promise<any>;
    response: (nodeId: string, action: string, params: object, meta: object, error: Error) => Promise<any>;
    statistics: any;
  };
  
  type TransportMessage = {
    type: string;
    targetNodeId: string;
    payload: object;
  };
  
  type TransportMessageHandler = (type: string, data: object) => void;
  
  type Service = {
    filename: string;
    runtime: Runtime;
    broker: Broker;
    log: Logger;
    version?: number;
    name: string;
    meta?: object;
    fullyQualifiedName: string;
    schema: object;
    settings: ServiceSettings;
    actions: { [key: string]: (data: object, options: ActionOptions) => any };
    events: { [key: string]: (context: Context) => any };
    methods: { [key: string]: Function };
    start: () => Promise<any>;
    stop: () => Promise<any>;
  };
  
  type Node = {
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
    services: Array<ServiceItem>;
    sequence: number;
    events?: Array<string>;
    IPList: Array<string>;
    update: (info: any, isLocal: boolean) => boolean;
    updateLocalInfo: (isLocal?: boolean) => void;
    heartbeat: (info: object) => void;
    disconnected: (isLocal?: boolean) => void;
  };
  
  type Endpoint = {
    node: Node;
    service: Service;
    action: ServiceAction;
    isLocal: boolean;
    state: boolean;
    name: string;
    updateAction: () => void;
    isAvailable: () => boolean;
  };
  
  type Registry = {
    runtime?: Runtime;
    log: Logger;
    serviceChanged?: ServiceChangedDelegate;
    nodeCollection?: NodeCollection;
    serviceCollection?: ServiceCollection;
    actionCollection?: ServiceActionCollection;
    eventCollection?: EventCollection;
    middlewareHandler?: MiddlewareHandler;
    init?: RegistryInitFunctionDef;
    onRegisterLocalAction: () => void;
    onRegisterRemoteAction: () => void;
    checkActionVisibility: () => void;
    deregisterService: (serviceName: string, version: number, nodeId?: string) => void;
    registerLocalService: (serviceItem: ServiceItem) => void;
    registerRemoteServices: (node: Node, services: Array<any>) => void;
    registerActions: (node: Node, serviceItem: ServiceItem, actions: Array<any>) => void;
    registerEvents: (node: Node, serviceItem: ServiceItem, events: Array<any>) => void;
    getNextAvailableActionEndpoint: (actionName: string) => Endpoint | Error;
    getActionList: (filterParams?: ServiceActionCollectionListFilterParams) => Array<any>;
    deregisterServiceByNodeId: (nodeId: string) => void;
    hasService: (serviceName: string, version: number, nodeId?: string) => boolean;
    getActionEndpointByNodeId: (actionName: string, nodeId: string) => Endpoint;
    getActionEndpoints: (actionName: string) => EndpointCollection;
    getLocalActionEndpoint: (actionName: string) => Endpoint;
  };
  
  type TracingCollector = any
  
  // Weitere Typdefinitionen wie NodeInfo, NodeClient, ServiceSettings, ServiceAction, usw., können in ähnlicher Weise definiert werden.
  // declare function defineAction<TParamsSchema extends { [key: string]: { type: keyof TypeMap } }>(action: ServiceActionSchema<TParamsSchema>): ServiceActionSchema<TParamsSchema>;
}


// declare function defineAction<TParamsSchema extends { [key: string]: { type: keyof TypeMap } }>(action: ServiceActionSchema<TParamsSchema>): ServiceActionSchema<TParamsSchema>;