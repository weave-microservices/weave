// Broker

/**
 * @typedef {object} ActionOptions
 * @property {object} meta Meta data
 * @property {Object<string, *>}
 */

/**
 * @callback CallActionFunctionDef
 * @param {string} actionName Name of the action
 * @param {object} data
 * @param {ActionOptions} options
 * @return {Promise<any>} Promise
 */

/**
 * This callback is displayed as a global member.
 * @callback ServiceChangedDelegate
 * @param {boolean} isLocalService
 * @returns {Promise<any>}
*/

/**
 * Event bus
 * @typedef {object} EventOptions
 * @property {Array<string>} [groups] Event groups // todo: add description
 * @property {string} [nodeId] Node ID
*/

/**
 * Event bus
 * @typedef EventBus
 * @property {function(string, object=, EventOptions=):Promise<any>} emit emit
 * @property {function(string, any, EventOptions=):Promise<any>} broadcast broadcast
 * @property {function(string, any, EventOptions=):Promise<any>} broadcastLocal broadcastLocal
*/

/**
 * Services
 * @typedef Services
 * @property {ServiceChangedDelegate} serviceChanged Service changed delegate
*/

/**
 * Broker interface
 * @typedef Runtime
 * @property {string} nodeId nodeId
 * @property {string} version Weave version
 * @property {string} [namespace] namespace
 * @property {BrokerOptions} [options] Broker options
 * @property {EventBus} eventBus Event bus
 * @property {Logger} [createLogger] Logger factory
 * @property {Services} services Service manager
 * @property {Transport} transport Transport
 * @property {MiddlewareHandler} middlewareHandler Middleware handler
 * @property {function(Error)} handleError handleError
 * @property {void} fatalError fatalError
*/

/**
 * Broker interface
 * @typedef Broker
 * @property {string} nodeId nodeId
 * @property {string} [namespace] namespace
 * @property {Runtime} runtime Runtime reference
 * @property {EventEmitter} bus bus
 * @property {string} version version
 * @property {BrokerOptions} options options
 * @property {MetricRegistry} [metrics] metrics
 * @property {Validator} validator validator
 * @property {Promise<any>} start start
 * @property {Promise<any>} stop stop
 * @property {function(ServiceSchema):Service} createService createService
 * @property {void} loadService loadService
 * @property {void} loadServices loadServices
 * @property {ContextFactory} contextFactory contextFactory
 * @property {Logger} log log
 * @property {Logger} createLogger createLogger
 * @property {Cache} [cache] cache
 * @property {string} getUUID getUUID
 * @property {any} health health
 * @property {Registry} registry registry
 * @property {Tracer} [tracer] tracer
 * @property {Transport} [transport] transport
 * @property {Endpoint | WeaveError} getNextActionEndpoint getNextActionEndpoint
 * @property {CallActionFunctionDef} call Call a service action.
 * @property {Promise<Array<any>>} multiCall multiCall
 * @property {function(string, any, any=):Promise<any>} emit emit
 * @property {function(string, any, any=):Promise<any>} broadcast broadcast
 * @property {function(string, any, any=):Promise<any>} broadcastLocal broadcastLocal
 * @property {Promise<any>} waitForServices waitForServices
 * @property {Promise<PingResult>} ping ping
 * @property {function(Error)} handleError handleError
 * @property {void} fatalError fatalError
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
 * @typedef {Object} TracingOptions
 * @property {Boolean} enabled Enable tracing middleware. (default = false)
 * @property {Number} tracingRate Rate of traced actions. (default = 1.0)
 * @property {Array<String|Object>} collectors Array of tracing collectors.
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} CacheOptions
 * @property {Boolean} enabled Enable cache middleware. (default = false)
 * @property {String]Object} adaper Cacha adapter. (default = memory (In Memory))
*/

/**
 * Configuration object for weave service broker.
 * @typedef {Object} CircuitBreakerOptions
 * @property {Boolean} enabled Enable circuit breaker middleware. (default = false)
 * @property {Boolean} failureOnError Prefer local actions over remote actions.
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
 * @typedef {Object} TransportOptions
 * @property {String|Object} adapter Transport adapter.
 * @property {Number} maxQueueSize Maximum queue size (default = 80000).
 * @property {Number} heartbeatInterval Number of milliseconds in which the heartbeat packet is sent to other nodes. (default = 5000 ms)
 * @property {Number} heartbeatTimeout Number of milliseconds without response before the node is set to the Not Available status. (default = 10000)
 * @property {Number} offlineNodeCheckInterval Interval in milliseconds to check and remove not offline nodes. (default = 30000ms)
 * @property {Number} maxOfflineTime Maximum time a node can be offline before it is removed from the registry. (default = 600000ms)
 * @property {Number} maxChunkSize Maximum chunk size for streams. (default = 256 * 1024 Bits)
 * @property {String|Object} serializer Serializer settings
 */

/**
 * Configuration object for logger.
 * @typedef {Object} LoggerOptions
 * @property {Boolean} enabled Enable logger.
 * @property {'fatal'|'error'|'warn'|'info'|'debug'|'trace'} level Log level of the messages to be displayed.
 * @property {Object<any>} defaultMeta Default meta data attached to every log message.
 * @property {Stream.Writable|Array} streams Destination to which the data is written, can be a single valid Writable stream or an array holding multiple valid Writable streams. (default = process.stdout).
 * @property {Boolean} displayTimestamp Show the current timestamp. (default = true)
 * @property {Boolean} displayBadge Show log type badge. (default = true)
 * @property {Boolean} displayLabel Show log type label. (default = true)
 * @property {Boolean} displayModuleName Show the module name. (default = true)
 * @property {Boolean} displayFilename Show the filename.
 * @property {Object} types Custom log types.
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
 * @property {BulkheadOptions} bulkhead Bulkhead options.
 * @property {CacheOptions} cache Cache options.
 * @property {ContextTracking} contextTracking Context tracking options.
 * @property {CircuitBreakerOptions} circuitBreaker Circuit breaker options.
 * @property {TransportOptions} transport Transport options.
 * @property {Function} [errorHandler] errorHandler.
 * @property {boolean} loadNodeService Enable or disable $node service.
 * @property {boolean} publishNodeService
 * @property {boolean} loadInternalMiddlewares Enable or disable internal middlewares.
 * @property {MetricsOptions} metrics Metrics options.
 * @property {Array<Middleware>} [middlewares] middlewares.
 * @property {LoggerOptions} [logger] logger.
 * @property {TracingOptions} tracing Tracing options.
 * @property {String} [namespace] namespace.
 * @property {RegistryOptions} [registry] registry.
 * @property {RetryPolicyOptions} retryPolicy
 * @property {ValidatorOptions} validatorOptions Validator options.
 * @property {boolean} [validateActionParams] validateActionParams.
 * @property {boolean} [watchServices] watchServices.
 * @property {number} [waitForServiceInterval] waitForServiceInterval.
 * @property {() => string} [beforeRegisterMiddlewares] beforeRegisterMiddlewares.
 * @property {() => string} [uuidFactory] uuidFactory.
 * @property {(this: Broker) => void} [started] started.
 * @property {(this: Broker) => void} [stopped] stopped.
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
 * @typedef {Object.<'fatal'|'error'|'warn'|'info'|'debug'|'trace', Function} Logger
*/

// Cache

/**
 * Cache interface
 * @typedef Cache
 * @property {string} [name] name
 * @property {LoggerOptions} options options
 * @property {void} init init
 * @property {Logger} log log
 * @property {Promise<any>} set set
 * @property {Promise<any>} get get
 * @property {Promise<any>} remove remove
 * @property {Promise<any>} clear clear
 * @property {string} getCachingHash getCachingHash
 * @property {Middleware} createMiddleware createMiddleware
 * @property {Promise<any>} stop stop
*/

// Context

/**
 * @export
 * @typedef ContextFactory
 * @property {void} init init
 * @property {Context} create create
*/

/**
 * @typedef {Object} ContextMetaObject
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
 * @property {any} info info
 * @property {number} level level
 * @property {number} [retryCount] retryCount
 * @property {Object} tracing tracing
 * @property {Object} span span
 * @property {Service} service service
 * @property {ServiceAction} [action] action
 * @property {string} [eventType] eventType
 * @property {string} [eventName] eventName
 * @property {Array<string>} [eventGroups] eventGroups
 * @property {ActionOptions} options options
 * @property {number} duration duration
 * @property {number} stopTime stopTime
 * @property {any} [metrics] metrics
 * @property {void} setData setData
 * @property {void} setEndpoint setEndpoint
 * @property {ContextPromise<any>} call call
 * @property {*} emit emit
 * @property {*} broadcast broadcast
 * @property {*} startSpan startSpan
 * @property {*} finishSpan finishSpan
 * @property {Context} copy copy
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
 * @property {string} getCachingHash getCachingHash
 * @property {Middleware} createMiddleware createMiddleware
 * @property {Promise<any>} stop stop
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
 * @property {Promise<any>} connect connect
 * @property {Promise<any>} disconnect disconnect
 * @property {void} setReady setReady
 * @property {Promise<any>} send send
 * @property {any} sendNodeInfo sendNodeInfo
 * @property {Promise<any>} sendPing sendPing
 * @property {Promise<any>} discoverNode discoverNode
 * @property {Promise<any>} discoverNodes discoverNodes
 * @property {Promise<any>} sendEvent sendEvent
 * @property {Promise<any>} sendBroadcastEvent sendBroadcastEvent
 * @property {void} removePendingRequestsById removePendingRequestsById
 * @property {void} removePendingRequestsByNodeId removePendingRequestsByNodeId
 * @property {TransportMessage} createMessage createMessage
 * @property {function(Context):Promise<any>} request request
 * @property {Promise<any>} response response
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
 * @property {Promise<void>} connect connect
 * @property {Promise<any>} subscribe subscribe
 * @property {void} connected connected
 * @property {void} disconnected disconnected
 * @property {Promise<any>} close close
 * @property {string} getTopic getTopic
 * @property {Promise<any>} preSend preSend
 * @property {Promise<any>} send send
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
 * @property {function(Node, ServiceItem, Array<any>)} registerActions registerActions
 * @property {function(Node, ServiceItem, Array<any>)} registerEvents registerEvents
 * @property {Endpoint | WeaveError} getNextAvailableActionEndpoint getNextAvailableActionEndpoint
 * @property {function(ServiceActionCollectionListFilterParams=):Array<any>} getActionList getActionList
 * @property {function(string): void} deregisterServiceByNodeId deregisterServiceByNodeId
 * @property {function(string, number, nodeId):boolean} hasService hasService
 * @property {function(string, string):Endpoint} getActionEndpointByNodeId getActionEndpointByNodeId
 * @property {function(string):EndpointCollection} getActionEndpoints getActionEndpoints
 * @property {function(ServiceAction):Endpoint} createPrivateActionEndpoint createPrivateActionEndpoint
 * @property {function(string):Endpoint} getLocalActionEndpoint getLocalActionEndpoint
 * @property {NodeInfo} getNodeInfo getNodeInfo
 * @property {NodeInfo} getLocalNodeInfo getLocalNodeInfo
 * @property {NodeInfo} generateLocalNodeInfo generateLocalNodeInfo
 * @property {*} processNodeInfo processNodeInfo
 * @property {function(string, boolean):void} nodeDisconnected nodeDisconnected
 * @property {function():void} removeNode removeNode
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
 * @property {boolean} add add
 * @property {boolean} hasAvailable hasAvailable
 * @property {boolean} hasLocal hasLocal
 * @property {function():Endpoint} getNextAvailableEndpoint getNextAvailableEndpoint
 * @property {function():Endpoint} getNextLocalEndpoint getNextLocalEndpoint
 * @property {function():number} count count
 * @property {function(string):Endpoint} getByNodeId getByNodeId
 * @property {void} removeByNodeId removeByNodeId
 * @property {void} removeByService removeByService
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
 * @property {Array<ServiceItem>} services services
 * @property {number} sequence sequence
 * @property {Array<string>} [events] events
 * @property {Array<string>} IPList IPList
 * @property {function(any, boolean):boolean} update update
 * @property {void} updateLocalInfo updateLocalInfo
 * @property {void} heartbeat heartbeat
 * @property {function(boolean=):void} disconnected disconnected
*/

/**
 * Endpoint
 *
 * @typedef Endpoint
 * @property {Node} node node
 * @property {Service} service service
 * @property {ServiceAction} action action
 * @property {boolean} isLocal isLocal
 * @property {boolean} state state
 * @property {string} name name
 * @property {void} updateAction updateAction
 * @property {boolean} isAvailable isAvailable
*/

/**
 * Event colleciton
 * @typedef EventCollection
 * @property {Endpoint} add add
 * @property {Endpoint} get get
 * @property {function(string, Node)} remove remove
 * @property {void} removeByService removeByService
 * @property {Array<Endpoint>} getBalancedEndpoints getBalancedEndpoints
 * @property {Array<Endpoint>} getAllEndpoints getAllEndpoints
 * @property {*} getAllEndpointsUniqueNodes getAllEndpointsUniqueNodes
 * @property {Promise<any>} emitLocal emitLocal
 * @property {function():Array<any>} list list
*/

/**
 * @typedef {object} NodeCollectionListFilterOptions
 * @property {boolean} [withServices=true] Output all services on an node.
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
 * @property {function(NodeCollectionListFilterOptions):Array<Node>} list list
 * @property {void} disconnected disconnected
 * @property {Array<Node>} toArray toArray
*/

/**
 * @typedef {Object} ServiceActionCollectionListFilterParams
 * @property {boolean} [onlyLocals] Shows only local service actions
 * @property {boolean} [skipInternals] Shows only local service actions
 * @property {boolean} [withEndpoints] Shows only local service actions
 */

/**
 * Service action collection
 * @typedef ServiceActionCollection
 * @property {*} add add
 * @property {function(string):EndpointCollection} get get
 * @property {function(service)} removeByService removeByService
 * @property {function(string, Node)} remove remove
 * @property {function(ServiceActionCollectionListFilterParams):Array<any>} list list
*/

/**
 * Service action handler
 * @typedef {function(this: Service, Context): Promise} ServiceActionHandler
*/

/**
 * Service method
 * @typedef {function(this: Service): Promise} ServiceMethodDefinition
*/

/**
 * Service action definition
 * @typedef ServiceActionDefinition
 * @property {Object} [params] params
 * @property {ServiceActionHandler} handler handler
*/

/**
 * @typedef {Object} ServiceCollectionListFilterParams
 * @property {boolean} [localOnly=false] Show only local services.
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
 * @property {function(string, string, number):void} remove remove
 * @property {function(string):void} removeAllByNodeId removeAllByNodeId
 * @property {*} registerAction registerAction
 * @property {function(string):EndpointCollection} tryFindActionsByActionName tryFindActionsByActionName
 * @property {function():Array<any>} getActionsList getActionsList
 * @property {function(ServiceCollectionListFilterParams)} list list
 * @property {function(string, string): Endpoint} findEndpointByNodeId findEndpointByNodeId
*/

/**
 * Service item. Used in the registry.
 * @typedef ServiceItem
 * @property {string} name name
 * @property {Node} node node
 * @property {any} settings settings
 * @property {number} version version
 * @property {any} actions actions
 * @property {any} events events
 * @property {boolean} isLocal isLocal
 * @property {function(any)} addAction addAction
 * @property {function(Node, SericeItem, any)} addEvent addEvent
 * @property {function(string, number, string=): boolean} equals equals
 * @property {function(any)} update update
*/

/**
 * Service schema
 * @typedef ServiceSchema
 * @property {string} name name
 * @property {number} [version] version
 * @property {Array<ServiceSchema> | ServiceSchema} mixins mixins
 * @property {ServiceSettings} settings settings
 * @property {Object} [meta] meta
 * @property {{[key: string]: Function }} hooks hooks
 * @property {Object.<string, ServiceActionDefinition | ServiceActionHandler>} [actions] actions
 * @property {{[key: string]: ServiceEvent }} [events] events
 * @property {Object.<string, ServiceMethodDefinition>} [methods] methods
 * @property {*} created created
 * @property {*} started started
 * @property {*} stopped stopped
*/

/**
 * Service instance
 * @export
 * @typedef Service
 * @property {string} filename filename
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
 * @property {Promise<any>} start start
 * @property {Promise<any>} stop stop
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
*/

// Midlewares

/**
 * Middleware handler
 * @export
 * @typedef MiddlewareHandler
 * @property {void} init init
 * @property {void} add add
 * @property {any} wrapMethod wrapMethod
 * @property {any} wrapHandler wrapHandler
 * @property {any} callHandlersAsync callHandlersAsync
 * @property {any} callHandlersSync callHandlersSync
*/

/**
 * Middleware
 * @typedef Middleware
 * @property {() => any} [created] created
 * @property {(broker: Broker) => any} [started] started
 * @property {(handler: any, action: ServiceAction) => any} [localAction] localAction
 * @property {(handler: any, action: ServiceAction) => any} [remoteAction] remoteAction
 * @property {(broker: Broker, handler: any, action: ServiceAction) => any} [localEvent] localEvent
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
 * @property {Promise<any>} stop stop
 * @property {boolean} shouldSample shouldSample
 * @property {void} invokeCollectorMethod invokeCollectorMethod
 * @property {Span} startSpan startSpan
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

module.exports = {}
