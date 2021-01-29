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
 * @param {number} responseCode
 * @param {string} responseMessage
*/

/**
 * Broker interface
 * @typedef Broker
 * @property {string} nodeId nodeId
 * @property {string} [namespace] namespace
 * @property {EventEmitter} bus bus
 * @property {string} version version
 * @property {BrokerOptions} options options
 * @property {MetricRegistry} [metrics] metrics
 * @property {Promise<any>} start start
 * @property {Promise<any>} stop stop
 * @property {function(ServiceSchema):Service} createService createService
 * @property {void} loadService loadService
 * @property {void} loadServices loadServices
 * @property {ContextFactory} contextFactory contextFactory
 * @property {Boolean} isStarted isStarted
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
 * @property {Promise<any>} emit emit
 * @property {Promise<any>} broadcast broadcast
 * @property {Promise<any>} broadcastLocal broadcastLocal
 * @property {Promise<any>} waitForServices waitForServices
 * @property {Promise<PingResult>} ping ping
 * @property {void} handleError handleError
 * @property {void} fatalError fatalError
*/

/**
 * @typedef BrokerOptions
 * @property {string} [nodeId] nodeId
 * @property {BulkheadOptions} bulkheadbulkhead
 * @property {CacheOptions} cachecache
 * @property {CircuitBreakerOptions} circuitBreakercircuitBreaker
 * @property {TransportOptions} transporttransport
 * @property {Function} [errorHandler] errorHandler
 * @property {boolean} loadNodeServiceloadNodeService
 * @property {boolean} publishNodeServicepublishNodeService
 * @property {boolean} loadInternalMiddlewaresloadInternalMiddlewares
 * @property {MetricsOptions} metricsmetrics
 * @property {Array<Middleware>} [middlewares] middlewares
 * @property {LoggerOptions} [logger] logger
 * @property {TracingOptions} tracingtracing
 * @property {String} [namespace] namespace
 * @property {RegistryOptions} [registry] registry
 * @property {RetryPolicyOptions} retryPolicyretryPolicy
 * @property {boolean} [validateActionParams] validateActionParams
 * @property {boolean} [watchServices] watchServices
 * @property {number} [waitForServiceInterval] waitForServiceInterval
 * @property {() => string} [beforeRegisterMiddlewares] beforeRegisterMiddlewares
 * @property {() => string} [uuidFactory] uuidFactory
 * @property {(this: Broker) => void} [started] started
 * @property {(this: Broker) => void} [stopped] stopped
*/

// Cache

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

// Context

/**
 * @export
 * @typedef ContextFactory
 * @property {void} init init
 * @property {Context} create create
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
 * @property {Object} meta meta
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
 * @property {void} request request
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
 * @property {void} incommingMessage incommingMessage
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
 * @property {Broker} [broker] broker
 * @property {Logger} [log] log
 * @property {ServiceChangedCallback} [serviceChanged]
 * @property {NodeCollection} [nodeCollection] nodeCollection
 * @property {ServiceCollection} [serviceCollection] serviceCollection
 * @property {ServiceActionCollection} [actionCollection] actionCollection
 * @property {EventCollection} [eventCollection] eventCollection
 * @property {MiddlewareHandler} [middlewareHandler] middlewareHandler
 * @property {RegistryInitFunctionDef=} init init
 * @property {void} onRegisterLocalAction onRegisterLocalAction
 * @property {void} onRegisterRemoteAction onRegisterRemoteAction
 * @property {*} checkActionVisibility checkActionVisibility
 * @property {void} deregisterService deregisterService
 * @property {void} registerLocalService registerLocalService
 * @property {void} registerRemoteServices registerRemoteServices
 * @property {void} registerActions registerActions
 * @property {void} registerEvents registerEvents
 * @property {Endpoint | WeaveError} getNextAvailableActionEndpoint getNextAvailableActionEndpoint
 * @property {Array<any>} getActionList getActionList
 * @property {void} deregisterServiceByNodeId deregisterServiceByNodeId
 * @property {boolean} hasService hasService
 * @property {Endpoint} getActionEndpointByNodeId getActionEndpointByNodeId
 * @property {EndpointCollection} getActionEndpoints getActionEndpoints
 * @property {Endpoint} createPrivateActionEndpoint createPrivateActionEndpoint
 * @property {Endpoint} getLocalActionEndpoint getLocalActionEndpoint
 * @property {NodeInfo} getNodeInfo getNodeInfo
 * @property {NodeInfo} getLocalNodeInfo getLocalNodeInfo
 * @property {NodeInfo} generateLocalNodeInfo generateLocalNodeInfo
 * @property {*} processNodeInfo processNodeInfo
 * @property {void} nodeDisconnected nodeDisconnected
 * @property {void} removeNode removeNode
 * @property {Array<any>} getNodeList getNodeList
 * @property {Array<any>} getServiceList getServiceList
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
 * @property {Endpoint} getNextAvailableEndpoint getNextAvailableEndpoint
 * @property {Endpoint} getNextLocalEndpoint getNextLocalEndpoint
 * @property {number} count count
 * @property {Endpoint} getByNodeId getByNodeId
 * @property {void} removeByNodeId removeByNodeId
 * @property {void} removeByService removeByService
*/

/**
 * Node
 *
 * @typedef Node
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
 * @property {void} remove remove
 * @property {void} removeByService removeByService
 * @property {Array<Endpoint>} getBalancedEndpoints getBalancedEndpoints
 * @property {Array<Endpoint>} getAllEndpoints getAllEndpoints
 * @property {*} getAllEndpointsUniqueNodes getAllEndpointsUniqueNodes
 * @property {Promise<any>} emitLocal emitLocal
 * @property {Array<any>} list list
*/

/**
 *
 * Node collection
 * @typedef NodeCollection
 * @property {Node} [localNode] localNode
 * @property {string} [hostname] hostname
 * @property {Node} createNode createNode
 * @property {void} add add
 * @property {boolean} has has
 * @property {Node} get get
 * @property {boolean} remove remove
 * @property {Array<Node>} list list
 * @property {void} disconnected disconnected
 * @property {Array<Node>} toArray toArray
*/

/**
 * Service action collection
 * @typedef ServiceActionCollection
 * @property {*} add add
 * @property {function(string):EndpointCollection} get get
 * @property {function(service)} removeByService removeByService
 * @property {function(event)} remove remove
 * @property {Array<any>} list list
*/

/**
 * Service action handler
 * @typedef {function} ServiceActionHandler
 * @this {Service}
 * @param {Context} context Action context
 * @returns {Promise} Result promise
*/

/**
 * Service action definition
 * @typedef ServiceActionDefinition
 * @property {Object} [params] params
 * @property {function(Context):Promise} handler handler
*/

/**
 * Service collection
 * @typedef ServiceCollection
 * @property {Array<ServiceItem>} services services
 * @property {ServiceItem} add add
 * @property {*} get get
 * @property {boolean} has has
 * @property {void} remove remove
 * @property {void} removeAllByNodeId removeAllByNodeId
 * @property {*} registerAction registerAction
 * @property {EndpointCollection} tryFindActionsByActionName tryFindActionsByActionName
 * @property {Array<Object>} getLocalActions getLocalActions
 * @property {Array<Object>} getActionsList getActionsList
 * @property {*} list list
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
 * @property {void} addAction addAction
 * @property {void} addEvent addEvent
 * @property {boolean} equals equals
 * @property {void} update update
*/

/**
 * Service schema
 * @typedef ServiceSchema
 * @property {string} name name
 * @property {number} [version] version
 * @property {Array<ServiceSchema> | ServiceSchema} mixins mixins
 * @property {ServiceSettings} settings settings
 * @property {Object} [meta] meta
 * @property {{[key: string]: Function }} hooks hooks
 * @property {{[key: string]: ServiceActionDefinition}} [actions] actions
 * @property {{[key: string]: ServiceEvent }} [events] events
 * @property {{ [key: string]: Function }} [methods] methods
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
