// eslint-disable-next-line no-unused-vars
const { EventEmitter2: EventEmitter } = require('eventemitter2');

/**
 * @typedef {import('stream').Stream} Stream
 * @typedef {import('stream').Writable} WritableStream
*/

// Broker

/**
 * @typedef {object} ActionOptions - Action options
 * @property {Context} [context] - Assign a existing context instead of creating a new one.
 * @property {Context} [parentContext] - Parent context of this action request.
 * @property {object} [meta] - Meta data.
 * @property {Stream} [stream] - Read stream.
 * @property {number} [timeout] - Timeout in milliseconds.
 * @property {number} [retries] - Retries before this request fails.
 * @property {Object<string, *>} [custom] - Properties
*/

/**
 * @callback CallActionFunctionDef - Action function definition
 * @param {string} actionName - Name of the action
 * @param {object} [data] - Payload
 * @param {ActionOptions} [options] - Action options
 * @return {Promise<any>} Promise - Result
 */

/**
 * This callback is displayed as a global member.
 * @callback ServiceChangedDelegate
 * @param {boolean} [isLocalService=false] - Local service
 * @returns {Promise<any>}
*/

/**
 * Event bus
 * @typedef {object} EventOptions
 * @property {Array<string>} [groups] - Event groups // todo: add description
 * @property {string} [nodeId] - Node ID
*/

/**
 * Event bus
 * @typedef EventBus
 * @property {function(string, object=, EventOptions=):Promise<any>} emit - Emit the event to a balanced endpoint.
 * @property {function(string, any, EventOptions=):Promise<any>} broadcast - Broadcast the event to all available service endpoints.
 * @property {function(string, any, EventOptions=):Promise<any>} broadcastLocal - Broadcast the event to all local service endpoints.
*/

/**
 * Services
 * @typedef Services
 * @property {ServiceChangedDelegate} serviceChanged - Service changed delegate
*/

/**
 * ActionInvoker
 * @typedef {object} ActionInvoker
 * @property {function(string, object, ActionOptions):Promise<any>} call - Call a
 * @property {function(string, object, ActionOptions):Promise<any>} multiCall - Service changed delegate
*/

/**
 * Runtime instance state
 * @typedef {Object} RuntimeInstanceState
 * @property {Boolean} isStarted - Services started flag.
 * @property {string} instanceId - Instance UUID.
*/

/**
 * Runtime interface
 * @typedef Runtime
 * @property {string} nodeId - Node ID of the broker
 * @property {string} version - Weave version of the broker.
 * @property {ActionInvoker} actionInvoker - Action invoker
 * @property {EventBus} [eventBus] - Service event bus
 * @property {EventEmitter} bus - Instance event bus
 * @property {Broker} [broker] - Broker reference.
 * @property {BrokerOptions} options - options
 * @property {RuntimeInstanceState} state - Instance state
 * @property {MetricRegistry} [metrics] - Metrics
 * @property {MiddlewareHandler} [middlewareHandler] - Middleware handler
 * @property {Validator} [validator] - validator
 * @property {ServiceManager} [services] - Service manager
 * @property {ContextFactory} [contextFactory] - contextFactory
 * @property {Logger} log - Logger instance
 * @property {function(string, any):Logger} [createLogger] - Create a new logger instace.
 * @property {Cache} [cache] - Cache
 * @property {string} [getUUID] - Create a new from the UUID factory.
 * @property {Registry} registry - Service registry reference
 * @property {Tracer} [tracer] - tracer
 * @property {Transport} [transport] - Transport
 * @property {function(Error):void} handleError handleError
 * @property {void} fatalError fatalError
 * @property {function():string} generateUUID - Generate a UUID.
*/

/**
 * Broker interface
 * @typedef Broker
 * @property {string} nodeId - Node ID of the broker
 * @property {string} [namespace] - Namespace of the broker
 * @property {Runtime} runtime - Runtime reference
 * @property {EventEmitter} bus - Event bus
 * @property {string} version - version
 * @property {BrokerOptions} options - options
 * @property {MetricRegistry} [metrics] - Metrics
 * @property {Validator} validator - validator
 * @property {function():Promise<any>} start - Start the broker.
 * @property {function():Promise<any>} stop - Stop the broker
 * @property {function(ServiceSchema):Service} createService - Create a new service with a service schema object.
 * @property {function(string):void} loadService - Load a service from a given path.
 * @property {function(string=, string=):void} loadServices - Load all services from a given directory.
 * @property {ContextFactory} contextFactory - contextFactory
 * @property {Logger} log - Logger instance
 * @property {function(string, any):Logger} createLogger - Create a new logger instace.
 * @property {Cache} [cache] - Cache
 * @property {function():string} getUUID - Create a new from the UUID factory.
 * @property {Registry} registry - Service registry reference
 * @property {Tracer} [tracer] - tracer
 * @property {Transport} [transport] - Transport
 * @property {function(string):Endpoint | function(string):Error} getNextActionEndpoint - Get the next action endpoint.
 * @property {CallActionFunctionDef} call - Call a service action.
 * @property {Promise<Array<any>>} multiCall - Multiple action calls
 * @property {function(string, any, any=):Promise<any>} emit - Emit
 * @property {function(string, any, any=):Promise<any>} broadcast broadcast
 * @property {function(string, any, any=):Promise<any>} broadcastLocal broadcastLocal
 * @property {function(Array<string>|string):Promise<any>} waitForServices waitForServices
 * @property {function(string, number=):Promise<PingResult>} ping ping
 * @property {function(Error):void} handleError handleError
 * @property {function():void} fatalError fatalError
*/

/**
 * Ping result
 * @typedef {Object<string, number>} PingResult
 */

/**
 * Configuration object for weave service broker.
 * @typedef {Object} BulkheadOptions
 * @property {Boolean} enabled Enable bulkhead middleware. (default = false)
 * @property {Number} concurrentCalls Maximum concurrent calls. (default = 15)
 * @property {Number} maxQueueSize Maximum queue size. (default = 150)
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} MetricsOptions
 * @property {Boolean} enabled Enable metric middleware. (default = false)
 * @property {Array<String|Object>} adapters Array of metric adapters.
 * @property {Boolean} collectCommonMetrics Enable the collection of common process and environment specific metrics.
 * @property {Number} collectInterval Refresh interval of the common metrics.
 * @property {Array<Number>} defaultBuckets Default buckets for histograms.
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} TracingErrorOptions
 * @property {Array<string>} fields - Fields of errors, that should be included in spans.
 * @property {Boolean} stackTrace - Include stacktrace in spans
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} TracingOptions
 * @property {Boolean} enabled - Enable tracing middleware. (default = false)
 * @property {Number} samplingRate - Rate of traced actions. (default = 1.0)
 * @property {Array<String|Object>} collectors - Array of tracing collectors.
 * @property {TracingErrorOptions} [errors] - Settings for tracing errors.
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} CacheLockOptions
 * @property {Boolean} [enabled=false] Enable cache lock. (default = false)
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} CacheOptions
 * @property {Boolean} enabled Enable cache middleware. (default = false)
 * @property {String | Object} adapter - Cache adapter. (default = memory (In Memory))
 * @property {number} [ttl=3000] - Cache item TTL.
 * @property {CacheLockOptions} [lock] Cache lock options.
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} CircuitBreakerOptions
 * @property {Boolean} enabled Enable circuit breaker middleware. (default = false)
 * @property {number} halfOpenTimeout - Time until the circuit breaker is set to half open.
 * @property {number} maxFailures - Number of failures after which the circuit breaker is opened.
 * @property {number} windowTime - Time period before the endpoint list is emptied.
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} RetryPolicyOptions
 * @property {Boolean} enabled Enable circuit breaker middleware. (default = false)
 * @property {Number} delay Delay in milliseconds before the next call is attempted. (default = 3000)
 * @property {Number} retries Number of attempts before the action call gets rejected. (default = 5)
 */

/**
 * Configuration object for weave service broker.
 * @typedef {Object} TransportStreamOptions
 * @property {Boolean} handleBackpressure Handle stream backpressure. (default = true)
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} TransportOptions
 * @property {String|Object} adapter Transport adapter.
 * @property {Number} maxQueueSize Maximum queue size (default = 80000).
 * @property {Number} heartbeatInterval - Number of milliseconds in which the heartbeat packet is sent to other nodes. (default = 5000 ms)
 * @property {Number} heartbeatTimeout - Number of milliseconds without response before the node is set to the Not Available status. (default = 10000)
 * @property {number} localNodeUpdateInterval - Interval at which the local node updates its data pool
 * @property {Number} offlineNodeCheckInterval - Interval in milliseconds to check and remove not offline nodes. (default = 30000ms)
 * @property {Number} maxOfflineTime - Maximum time a node can be offline before it is removed from the registry. (default = 600000ms)
 * @property {Number} maxChunkSize - Maximum chunk size for streams. (default = 256 * 1024 Bits)
 * @property {TransportStreamOptions} streams - Transport stream options.
 */

/**
 * Configuration object for logger.
 * @typedef {Object} LoggerOptions - Logger options
 * @property {Boolean} [enabled=true] - Enable logger.
 * @property {'verbose'|'debug'|'info'|'warn'|'error'|'fatal'} [level=info] - Log level.
 * @property {string} [messageKey=msg] - Key of the message property.
 * @property {Object.<string, number>} [customLevels] - Log level of the messages to be displayed.
 * @property {Object.<string, number | string>} [base] - Default meta data attached to every log message.
 * @property {WritableStream} [destination=process.stdout] - Destination to which the data is written, can be a single valid Writable stream or an array holding multiple valid Writable streams. (default = process.stdout).
 */

/**
 * Context tracking options.
 * @typedef {Object} ContextTracking
 * @property {Boolean} enabled Enable context tracker.
 * @property {Number} shutdownTimeout Timeout for service shutdown.
 */

/**
 * Validator options.
 * @typedef {Object} ValidatorOptions
 * @property {Boolean} strict Enable the strict mode of the validator.
 * @property {'remove'|'error'} strictMode How to deal with parameters that are not allowed.How to handle parameters that are not allowed. `remove`: remove all undefined parameters. `error`: throw a validation error
 */

/**
 * @typedef BrokerOptions
 * @property {string} [nodeId] Node ID. Needs to be unique in your environment.
 * @property {BulkheadOptions} [bulkhead] Bulkhead options.
 * @property {CacheOptions} [cache] Cache options.
 * @property {ContextTracking} [contextTracking] Context tracking options.
 * @property {CircuitBreakerOptions} [circuitBreaker] Circuit breaker options.
 * @property {TransportOptions} [transport] Transport options.
 * @property {Function} [errorHandler] errorHandler.
 * @property {boolean} [loadInternalMiddlewares=true] Enable or disable internal middlewares.
 * @property {MetricsOptions} [metrics] Metrics options.
 * @property {Array<Middleware>} [middlewares] middlewares.
 * @property {LoggerOptions} [logger] logger.
 * @property {TracingOptions} [tracing] Tracing options.
 * @property {String} [namespace] namespace.
 * @property {RegistryOptions} [registry] registry.
 * @property {RetryPolicyOptions} [retryPolicy] - Retry policy
 * @property {ValidatorOptions} [validatorOptions] Validator options.
 * @property {boolean} [validateActionParams] validateActionParams.
 * @property {boolean} [watchServices] watchServices.
 * @property {number} [waitForServiceInterval] waitForServiceInterval.
 * @property {function():string} [beforeRegisterMiddlewares] beforeRegisterMiddlewares.
 * @property {function(Runtime):string} [uuidFactory] uuidFactory.
 * @property {function():void} [started] started.
 * @property {function():void} [stopped] stopped.
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} RegistryOptions
 * @property {Boolean} preferLocalActions Prefer local actions over remote actions. (default = true)
 * @property {boolean} publishNodeService Publish the node service actions.
 * @property {Number} requestTimeout Time in milliseconds before a action call is rejected. (default = 0)
 * @property {Number} maxCallLevel Maximum request depth level.
 * @property {String|Object} loadBalancingStrategy - Stratagy for the internal load balancer. (default = 'round_robin')
*/

/**
 * @typedef {Object} Logger
 * @typedef {Object.<string, *>}
*/

/**
 * @export
 * @typedef ContextFactory
 * @property {void} init init
 * @property {function(Endpoint, object, ActionOptions):Context} create create
*/

/**
 * @typedef {Object} ContextMetaObject
*/

/**
 * Context result
 * @typedef {Promise<any>} ContextPromise
 * @property {Context} context - Context
 */

/**
 * Context interface.
 * @typedef Context
 * @property {string} [id] id
 * @property {string} [requestId] requestId
 * @property {string} nodeId nodeId
 * @property {string} [callerNodeId] callerNodeId
 * @property {Context} [parentContext] parentContext
 * @property {string} [parentId] parentId
 * @property {Endpoint} [endpoint] endpoint
 * @property {Object} data data
 * @property {ContextMetaObject} meta meta
 * @property {number} level level
 * @property {number} [retryCount] retryCount
 * @property {Object} tracing tracing
 * @property {Object} span span
 * @property {Service} service service
 * @property {ServiceAction} [action] action
 * @property {number} [startHighResolutionTime] - High resolution start timestamp.
 * @property {string} [eventType] eventType
 * @property {string} [eventName] eventName
 * @property {Array<string>} [eventGroups] eventGroups
 * @property {ActionOptions} options options
 * @property {number} duration duration
 * @property {number} stopTime stopTime
 * @property {any} [metrics] metrics
 * @property {function(any):void} setData - Set data object.
 * @property {CallActionFunctionDef} call - Call a service action
 * @property {function(string, object):Promise<any>} emit emit
 * @property {Stream} [stream] - Stream
 * @property {function(string, any):Promise<any>} broadcast Broadcast an event to all listener.
 * @property {function():void} startSpan startSpan
 * @property {function():void} finishSpan finishSpan
 * @property {function():Context} copy - Copy the current context.
 * @property {function(Stream):void} setStream - Set the context data stream.
 * @property {function(Endpoint):void} setEndpoint - Set data object.
*/

/**
 * Cache interface
 * @typedef Cache
 * @property {string} [name] name
 * @property {any} options options
 * @property {void} init init
 * @property {Logger} log log
 * @property {Promise<any>} set set
 * @property {Promise<any>} get get
 * @property {Promise<any>} remove remove
 * @property {Promise<any>} clear clear
 * @property {string} getCachingKey getCachingKey
 * @property {function():Middleware} createMiddleware createMiddleware
 * @property {function():Promise<any>} stop stop
*/

// Transport

/**
 * Transport interface
 * @export
 * @typedef Transport
 * @property {Broker} broker broker
 * @property {Logger} log log
 * @property {Boolean} isConnected isConnected
 * @property {Boolean} isReady isReady
 * @property {PendingStore} pending pending
 * @property {Function} resolveConnect resolveConnect
 * @property {string} adapterName adapterName
 * @property {function():Promise<any>} connect connect
 * @property {function():Promise<any>} disconnect disconnect
 * @property {function():Promise<any>} setReady setReady
 * @property {function(TransportMessage):Promise<any>} send send
 * @property {any} sendNodeInfo sendNodeInfo
 * @property {function():Promise<any>} sendPing sendPing
 * @property {function(string):Promise<any>} discoverNode discoverNode
 * @property {function():Promise<any>} discoverNodes discoverNodes
 * @property {Promise<any>} sendEvent sendEvent
 * @property {Promise<any>} sendBroadcastEvent sendBroadcastEvent
 * @property {void} removePendingRequestsById removePendingRequestsById
 * @property {void} removePendingRequestsByNodeId removePendingRequestsByNodeId
 * @property {function(string, string, object):TransportMessage} createMessage createMessage
 * @property {function(Context):Promise<any>} request request
 * @property {function(string, string, object, object, Error):Promise<any>} response response
 * @property {any} statistics statistics
*/

/**
 * Transport adapter interface.
 * @typedef TransportAdapter
 * @property {string} name name
 * @property {Broker} [broker] broker
 * @property {Transport} [transport] transport
 * @property {MessageHandlerResult} [messageHandler] messageHandler
 * @property {Logger} [log] log
 * @property {EventEmitter} bus bus
 * @property {Function} afterInit afterInit
 * @property {boolean} isConnected isConnected
 * @property {number} interruptCounter interruptCounter
 * @property {number} repeatAttemptCounter repeatAttemptCounter
 * @property {*} init init
 * @property {function(boolean, function():void):Promise<void>} connect connect
 * @property {function(string, string=):Promise<any>} subscribe Subscribe to message type.
 * @property {void} connected connected
 * @property {void} disconnected disconnected
 * @property {function():Promise<any>} close close
 * @property {string} getTopic getTopic
 * @property {function(Message):Promise<any>} preSend preSend
 * @property {function(Message):Promise<any>} send send
 * @property {void} incomingMessage incomingMessage
 * @property {Buffer} serialize serialize
 * @property {any} deserialize deserialize
 * @property {void} updateStatisticSent updateStatisticSent
 * @property {void} updateStatisticReceived updateStatisticReceived
 */

/**
 * Transport request interface
 * @export
 * @typedef TransportRequest
 * @property {string} targetNodeId targetNodeId
 * @property {string} action action
 * @property {Context} context context
 * @property {any} resolve resolve
 * @property {any} reject reject
 * @property {boolean} isStream isStream
 */

/**
 * Transport adapter interface.
 * @export
 * @typedef TCPTransportAdapter
 * @property {(nodeId: string) => Promise<any>} [sendHello] sendHello
 * @extends {TransportAdapter}
*/

/**
 * TCP discovery service interface
 * @typedef TCPDiscoveryService
 * @property {EventEmitter} bus bus
 * @property {Promise<any>} init init
 * @property {void} close close
*/

// Registry

/**
 * Registry init function
 * @typedef {function} RegistryInitFunctionDef
 * @param {function(Broker, MiddlewareHandler, ServiceChangedDelegate):Promise} init Init
 * @returns {void}
*/

/**
 * Registry interface
 * @typedef Registry
 * @property {Runtime} [runtime] Runtime reference
 * @property {Logger} log Logger
 * @property {ServiceChangedCallback} [serviceChanged]
 * @property {NodeCollection} [nodeCollection] nodeCollection
 * @property {ServiceCollection} [serviceCollection] serviceCollection
 * @property {ServiceActionCollection} [actionCollection] actionCollection
 * @property {EventCollection} [eventCollection] eventCollection
 * @property {MiddlewareHandler} [middlewareHandler] middlewareHandler
 * @property {RegistryInitFunctionDef=} init init
 * @property {function} onRegisterLocalAction onRegisterLocalAction
 * @property {function} onRegisterRemoteAction onRegisterRemoteAction
 * @property {*} checkActionVisibility checkActionVisibility
 * @property {function(string, number, string=):void} deregisterService deregisterService
 * @property {function(ServiceItem): void} registerLocalService registerLocalService
 * @property {function(Node, Array<any>): void} registerRemoteServices registerRemoteServices
 * @property {function(Node, ServiceItem, Array<any>):void} registerActions registerActions
 * @property {function(Node, ServiceItem, Array<any>):void} registerEvents registerEvents
 * @property {Endpoint | WeaveError} getNextAvailableActionEndpoint getNextAvailableActionEndpoint
 * @property {function(ServiceActionCollectionListFilterParams=):Array<any>} getActionList getActionList
 * @property {function(string): void} deregisterServiceByNodeId deregisterServiceByNodeId
 * @property {function(string, number, string):boolean} hasService hasService
 * @property {function(string, string):Endpoint} getActionEndpointByNodeId getActionEndpointByNodeId
 * @property {function(string):EndpointCollection} getActionEndpoints getActionEndpoints
 * @property {function(ServiceAction):Endpoint} createPrivateActionEndpoint createPrivateActionEndpoint
 * @property {function(string):Endpoint} getLocalActionEndpoint getLocalActionEndpoint
 * @property {function():NodeInfo} getNodeInfo getNodeInfo
 * @property {function():NodeInfo} getLocalNodeInfo getLocalNodeInfo
 * @property {function(Boolean=):NodeInfo} generateLocalNodeInfo generateLocalNodeInfo
 * @property {*} processNodeInfo processNodeInfo
 * @property {function(string, boolean):void} nodeDisconnected nodeDisconnected
 * @property {function(string):void} removeNode removeNode
 * @property {function(NodeCollectionListFilterOptions):Array<any>} getNodeList getNodeList
 * @property {function(ServiceCollectionListFilterParams):Array<any>} getServiceList getServiceList
*/

/**
 * Endpoint collection
 *
 * @typedef EndpointCollection
 * @property {string} name name
 * @property {string} groupName groupName
 * @property {boolean} isInternal isInternal
 * @property {Array<Endpoint>} endpoints endpoints
 * @property {Array<Endpoint>} localEndpoints localEndpoints
 * @property {function():boolean} add add
 * @property {function():boolean} hasAvailable hasAvailable
 * @property {function():boolean} hasLocal hasLocal
 * @property {function():Endpoint} getNextAvailableEndpoint getNextAvailableEndpoint
 * @property {function():Endpoint} getNextLocalEndpoint getNextLocalEndpoint
 * @property {function():number} count count
 * @property {function(string):Endpoint} getByNodeId getByNodeId
 * @property {function(string):void} removeByNodeId removeByNodeId
 * @property {function(string):Endpoint} endpointByNodeId Get endpoint by node ID.
 * @property {function():void} removeByService removeByService
*/

/**
 * Node interface
 * @typedef Node
 * @property {string} id id
 * @property {NodeInfo} info info
 * @property {boolean} isLocal isLocal
 * @property {NodeClient} client client
 * @property {number} [cpu] cpu
 * @property {number} [cpuSequence] cpuSequence
 * @property {number} lastHeartbeatTime lastHeartbeatTime
 * @property {number} offlineTime offlineTime
 * @property {boolean} isAvailable isAvailable
 * @property {boolean} wasDisconnectedUnexpectedly Node was disconnected unexpectedly
 * @property {Array<ServiceItem>} services services
 * @property {number} sequence sequence
 * @property {Array<string>} [events] events
 * @property {Array<string>} IPList IPList
 * @property {function(any, boolean):boolean} update update
 * @property {function(boolean=):void} updateLocalInfo updateLocalInfo
 * @property {function(object):void} heartbeat - Process heartbeat package
 * @property {function(boolean=):void} disconnected disconnected
*/

/**
 * Endpoint
 * @typedef Endpoint
 * @property {Node} node node
 * @property {Service} service service
 * @property {ServiceAction} action action
 * @property {boolean} isLocal isLocal
 * @property {boolean} state state
 * @property {string} name name
 * @property {void} updateAction updateAction
 * @property {function():boolean} isAvailable isAvailable
*/

/**
 * Event colleciton
 * @typedef EventCollection
 * @property {function(Node, Service, EventCollection):Endpoint} add add
 * @property {Endpoint} get get
 * @property {function(string, Node):void} remove remove
 * @property {function(Service):void} removeByService removeByService
 * @property {Array<Endpoint>} getBalancedEndpoints getBalancedEndpoints
 * @property {Array<Endpoint>} getAllEndpoints getAllEndpoints
 * @property {*} getAllEndpointsUniqueNodes getAllEndpointsUniqueNodes
 * @property {function(Context):Promise<any>} emitLocal emitLocal
 * @property {function():Array<any>} list list
*/

/**
 * @typedef {object} NodeCollectionListFilterOptions
 * @property {boolean} [availableOnly=false] Git only available nodes.
 * @property {boolean} [withServices=false] Output all services on an node.
*/

/**
 *
 * Node collection
 * @typedef NodeCollection
 * @property {Node} [localNode] localNode
 * @property {string} [hostname] hostname
 * @property {Node} createNode createNode
 * @property {function(string, Node):void} add add
 * @property {boolean} has has
 * @property {function(string):Node} get get
 * @property {function(string):boolean} remove remove
 * @property {function(NodeCollectionListFilterOptions=):Array<Node>} list list
 * @property {void} disconnected disconnected
 * @property {Array<Node>} toArray toArray
*/

/**
 * @typedef {Object} ServiceActionCollectionListFilterParams
 * @property {boolean} [onlyLocals=false] Shows only local service actions
 * @property {boolean} [skipInternals=false] Shows only local service actions
 * @property {boolean} [withEndpoints=false] Shows only local service actions
 */

/**
 * Service action collection
 * @typedef ServiceActionCollection
 * @property {*} add add
 * @property {function(string):EndpointCollection} get get
 * @property {function(Service):void} removeByService removeByService
 * @property {function(string, Node):void} remove remove
 * @property {function(ServiceActionCollectionListFilterParams):Array<any>} list list
*/

/**
 * Service action handler
 * @typedef {function(this: Service, Context): Promise<any>} ServiceActionHandler
*/

/**
 * Service method
 * @typedef {function(this: Service): Promise} ServiceMethodDefinition
*/

/**
 * Service action definition
 * @typedef ServiceActionDefinition
 * @property {Object} [params] params
 * @property {function(this: Service, Context):Promise<any> | any} handler handler
*/

/**
 * @typedef {Object} ServiceCollectionListFilterParams
 * @property {boolean} [localOnly=false] Show only local services.
 * @property {boolean} [availableOnly=false] Show only available services.
 * @property {boolean} [withActions=false] Include actions in result.
 * @property {boolean} [withEvents=false] Include events in result.
 * @property {boolean} [withNodeService=false] Include node service.
 * @property {boolean} [withSettings=false] Include service settings.
*/

/**
 * Service collection
 * @typedef ServiceCollection
 * @property {Array<ServiceItem>} services services
 * @property {function(Node,string, number, any):ServiceItem} add Add a new service to service collection.
 * @property {*} get get
 * @property {function(string, number, string):boolean} has has
 * @property {function(string, string, number=):void} remove Remove endpoint by node ID, service name and version*.
 * @property {function(string):void} removeAllByNodeId Remove all endpoints by node ID.
 * @property {*} registerAction registerAction
 * @property {function(string):EndpointCollection} tryFindActionsByActionName tryFindActionsByActionName
 * @property {function():Array<any>} getActionsList getActionsList
 * @property {function(ServiceCollectionListFilterParams): Array<object>} list list
 * @property {function(string, string): Endpoint} findEndpointByNodeId findEndpointByNodeId
*/

/**
 * Service item. Used in the registry.
 * @typedef ServiceItem
 * @property {string} name name
 * @property {Node} node node
 * @property {Object.<string, any>} settings settings
 * @property {number} version version
 * @property {any} actions actions
 * @property {any} events events
 * @property {boolean} isLocal isLocal
 * @property {function(Action):void} addAction addAction
 * @property {function(Event):void} addEvent addEvent
 * @property {function(string, number, string=): boolean} equals equals
 * @property {function(any):void} update update
*/

/**
 * Service schema
 * @typedef ServiceSchema
 * @property {string} name name
 * @property {Array<string>=} dependencies - Service dependencies
 * @property {number=} [version] version
 * @property {Array<ServiceSchema> | ServiceSchema=} mixins mixins
 * @property {ServiceSettings=} settings settings
 * @property {Object=} [meta] meta
 * @property {{[key: string]: Function }=} hooks hooks
 * @property {Object.<string, ServiceActionDefinition | ServiceActionHandler | boolean>=} [actions] actions
 * @property {{[key: string]: ServiceEvent }=} [events] events
 * @property {Object.<string, ServiceMethodDefinition>=} [methods] methods
 * @property {*=} [created] - Created hook
 * @property {*=} [started] - Started hook
 * @property {*=} [stopped] - Stopped hook
 * @property {function():void |Array<function():void>=} afterSchemasMerged - After schemas merged hook
*/

/**
 * Service instance
 * @export
 * @typedef Service
 * @property {string} filename filename
 * @property {Runtime} runtime - Runtime reference
 * @property {Broker} broker broker
 * @property {Logger} log log
 * @property {number} [version] version
 * @property {string} name name
 * @property {Object} [meta] meta
 * @property {string} fullyQualifiedName fullyQualifiedName
 * @property {Object} schema schema
 * @property {ServiceSettings} settings settings
 * @property {{[key: string]: (data: Object, options: ActionOptions) => {} }} [actions] actions
 * @property {{[key: string]: (context: Context) => {} }} [events] events
 * @property {{ [key: string]: Function }} [methods] methods
 * @property {function():Promise<any>} start start
 * @property {function():Promise<any>} stop stop
*/

// Health handler
/**
 * Health handler
 * @typedef HealthHandler
 * @property {void} init init
 * @property {NodeClient} getClientInfo getClientInfo
 * @property {any} getOsInfos getOsInfos
 * @property {any} getProcessInfos getProcessInfos
 * @property {any} getMemoryInfos getMemoryInfos
 * @property {any} getCPUInfos getCPUInfos
 * @property {any} getTransportInfos getTransportInfos
 * @property {any} getNodeHealthInfo getNodeHealthInfo
 */

// Metrics

/**
 * Metric registry
 * @typedef MetricRegistry
 * @property {Broker} broker broker
 * @property {any} options options
 * @property {Logger} log log
 * @property {void} init init
 * @property {Metric} register register
 * @property {void} increment increment
 * @property {void} decrement decrement
 * @property {void} timer timer
 * @property {Metric} getMetric getMetric
 * @property {any} list list
 * @property {function():Promise<any>} stop list
*/

// Midlewares

/**
 * Middleware handler
 * @export
 * @typedef MiddlewareHandler
 * @property {void} init init
 * @property {function(Middleware)} add add
 * @property {any} wrapMethod wrapMethod
 * @property {any} wrapHandler wrapHandler
 * @property {any} callHandlersAsync callHandlersAsync
 * @property {any} callHandlersSync callHandlersSync
*/

/**
 * Middleware
 * @typedef Middleware
 * @property {() => any} [created] created
 * @property {function(Broker):void} [started] started
 * @property {function(any, ServiceAction): any} [localAction] localAction
 * @property {(handler: any, action: ServiceAction) => any} [remoteAction] remoteAction
 * @property {function(any, ServiceAction): any} [localEvent] localEvent
 * @property {(next: Function) => MiddlewareEventDelegate} [emit] emit
 * @property {(next: Function) => MiddlewareEventDelegate} [broadcast] broadcast
 * @property {(next: Function) => MiddlewareEventDelegate} [broadcastLocal] broadcastLocal
 * @property {() => any} [brokerStopped] brokerStopped
*/

// Validator

/**
 * Validator
 * @typedef {Object} Validator
*/

// Tracer

/**
 * Tracer instance
 * @typedef Tracer
 * @property {void} init init
 * @property {function():Promise<any>} stop stop
 * @property {boolean} shouldSample shouldSample
 * @property {function():void} invokeCollectorMethod invokeCollectorMethod
 * @property {function(string, object):Span} startSpan startSpan
*/

/**
 * Tracing collection
 * @typedef TracingCollector
 * @property {void} init init
 * @property {void} initBase initBase
 * @property {void} startedSpan startedSpan
 * @property {void} finishedSpan finishedSpan
 * @property {Promise<void>} stop stop
 * @property {Array<any>} flattenTags flattenTags
 * @property {string} getErrorFields getErrorFields
*/

/**
 * Span interface
 * @typedef Span
 * @property {string} name name
 * @property {string} id id
 * @property {string} traceId traceId
 * @property {string} parentId parentId
 * @property {string} type type
 * @property {boolean} sampled sampled
 * @property {number} [finishTime] finishTime
 * @property {number} [duration] duration
 * @property {Error} [error] error
 * @property {any} service service
 * @property {any} [tags] tags
 * @property {number} [startTime] startTime
 * @property {Span} addTags addTags
 * @property {Span} start start
 * @property {Span} startChildSpan startChildSpan
 * @property {Span} finish finish
 * @property {boolean} isActive isActive
 * @property {*} setError setError
*/

/**
 * Transport Message
 * @typedef {object} TransportMessage
 * @property {string} type - Message type
 * @property {string} targetNodeId - Id of the target node
 * @property {object} payload - Payload to send
 */

/**
 * @callback TransportMessageHandler
 * @param {string} Type - Message type
 * @param {object} data - Payload
 */

module.exports = {};
