const http = require('http')
const stream = require('stream')
const spdy = require('spdy')
const { isFunction, isObject, isString, compact } = require('lodash')
const queryString = require('qs')
const bodyParser = require('body-parser')
const { promisify } = require('fachwork')
const pathToRegex = require('./path-to-regex.js')
const serveStatic = require('./serve-static')
const MemoryRateLimitStore = require('./store/memory')
const { WeaveError, WeaveServiceNotFoundError } = require('@weave-js/core').Errors
const { RateLimitExeededError } = require('./errors')
const { MAPPING_POLICY_RESTRICTED, MAPPING_POLICY_ALL } = require('./constants')

function isReadableStream (obj) {
    return (obj instanceof stream.Readable && typeof obj._read === 'function' && typeof obj._readableState === 'object')
}

module.exports = {
    name: 'weave-web',
    settings: {
        port: 3000,
        ip: '0.0.0.0',
        routing: {
            historyMode: false
        },
        routes: [
            {
                path: '/',
                // mappingPolicy: MAPPING_POLICY_ALL
                bodyParsers: {
                    json: true
                }
            }
        ]
    },
    actions: {
        rest (context) {
            const { request, response } = context.params

            request.$context = context
            response.$context = context

            if (context.requestId) {
                response.setHeader('X-Request-Id', context.requestId)
            }

            let { url, query } = this.processQueryString(request)

            if (url.length > 1 && url.endsWith('/')) {
                url = url.slice(0, -1)
            }

            request.parsedUrl = url

            if (!request.query) {
                request.query = query
            }

            if (!this.routes || this.routes.length === 0) {
                return null
            }

            for (let i = 0; i < this.routes.length; i++) {
                const route = this.routes[i]

                if (url.startsWith(route.path)) {
                    return this.routeHandler(context, route, request, response)
                }
            }
            return null
        }
    },
    methods: {
        handleRequest (request, response) {
            request.$service = this
            return this.actions.rest({ request, response })
                .then(result => {
                    if (result == null) {
                        if (this.serve) {
                            this.serve(request, response, error => {
                                // if (this.settings.routing.historyMode) {
                                //     return returnFile(this.settings.assets.folder + '/index.html')
                                // }
                                this.send404(response)
                            })
                            return
                        }

                        this.send404(response)
                    }
                })
                .catch(error => {
                    this.log.error(error.message)
                    this.sendError(request, response, error)
                })
            // const self = this
            // let { url, query } = self.processQueryString(request)

            // request.query = query

            // if (url.endsWith('/')) {
            //     url = url.slice(0, -1)
            // }

            // try {
            //     // if (self.routes && self.routes.length > 0) {
            //     //     for (let i = 0; i < self.routes.length; i++) {
            //     //         const route = self.routes[i]
            //     //         // pointer to route
            //     //         request.$route = route
            //     //         response.$route = route

            //     //         if (url.startsWith(route.path)) {
            //     //             self.wrapMiddlewares(route.middlewares)(request, response, error => {
            //     //                 if (error) {
            //     //                     self.log.error(`Middleware error!`, error)
            //     //                     return this.sendError(request, response, error)
            //     //                 }

            //     //                 if (route.cors) {
            //     //                     if (request.method === 'OPTIONS' && request.headers['access-control-request-method']) {
            //     //                         this.writeCorsHeaders(route, request, response, true)
            //     //                         response.writeHead(204, {
            //     //                             'Content-Length': '0'
            //     //                         })
            //     //                         response.end()
            //     //                         return
            //     //                     }
            //     //                     this.writeCorsHeaders(route, request, response, true)
            //     //                 }

            //     //                 let urlPath = url.slice(route.path.length)

            //     //                 if (urlPath.startsWith('/')) {
            //     //                     urlPath = urlPath.slice(1)
            //     //                 }

            //     //                 urlPath = urlPath.replace(/~/, '$')
            //     //                 let actionName = urlPath
            //     //                 actionName = actionName.replace(/\//g, '.')

            //     //                 if (route.aliases && route.aliases.length > 0) {
            //     //                     const result = self.resolveAlias(route, urlPath, request.method)
            //     //                     // found a matching alias.
            //     //                     if (result) {
            //     //                         route.$alias = result
            //     //                         // check for custom action handler
            //     //                         if (result.alias.handler) {
            //     //                             return result.alias.handler.call(this, request, response, error => {
            //     //                                 if (error) {
            //     //                                     // todo: Weave error
            //     //                                     this.log.error(`Alias custom method error!`, error)
            //     //                                     return this.sendError(request, response, error)
            //     //                                 }
            //     //                                 // todo: finish
            //     //                             })
            //     //                         }

            //     //                         query = Object.assign(result.params, query)
            //     //                         actionName = result.alias.actionName
            //     //                         // if mapping policy is "restricted" send a 404.
            //     //                     } else if (route.mappingPolicy === MAPPING_POLICY_RESTRICTED) {
            //     //                         return self.send404(response)
            //     //                     }
            //     //                 } else if (route.mappingPolicy === MAPPING_POLICY_RESTRICTED) {
            //     //                     return self.send404(response)
            //     //                 }
            //     //                 this.preCallAction(actionName, query, route, request, response)
            //     //             })
            //     //             return
            //     //         }
            //     //     }
            //     // }

            //     // if (self.serve) {
            //     //     self.serve(request, response, (returnFile) => {
            //     //         if (this.settings.routing.historyMode) {
            //     //             return returnFile(this.settings.assets.folder + '/index.html')
            //     //         }
            //     //         self.send404(response)
            //     //     })
            //     //     return
            //     // }
            //     // self.send404(response)
            // } catch (error) {
            //     self.log.error(error.message)
            //     this.sendError(request, response, error)
            // }
        },
        routeHandler (context, route, request, response) {
            request.$route = route
            response.$route = route

            return new Promise((resolve, reject) => {
                return this.wrapMiddlewaresPromisified(request, response, route.middlewares)
                    .then(() => {
                        let params = {}
                        if (route.cors) {
                            this.writeCorsHeaders(route, request, response, true)
                            if (request.method === 'OPTIONS' && request.headers['access-control-request-method']) {
                                this.writeCorsHeaders(route, request, response, true)
                                response.writeHead(204, {
                                    'Content-Length': '0'
                                })
                                response.end()
                                return true
                            }
                        }

                        // todo: merge params
                        const body = request.body ? request.body : {}
                        params = Object.assign(params, body, request.query)

                        request.$params = params

                        let urlPath = request.parsedUrl.slice(route.path.length)

                        if (urlPath.startsWith('/')) {
                            urlPath = urlPath.slice(1)
                        }
                        // internal services
                        urlPath = urlPath.replace(/~/, '$')

                        let actionName = urlPath

                        if (route.aliases && route.aliases.length > 0) {
                            const result = this.resolveAlias(route, urlPath, request.method)
                            // found a matching alias.
                            if (result) {
                                const alias = result.alias
                                route.$alias = alias
                                Object.assign(params, result.params)
                                return this.preCallAction(request, response, alias)
                            } else if (route.mappingPolicy === MAPPING_POLICY_RESTRICTED) {
                                return null
                            }
                        } else if (route.mappingPolicy === MAPPING_POLICY_RESTRICTED) {
                            return null
                        }

                        if (!actionName) {
                            return null
                        }

                        actionName = actionName.replace(/\//g, '.')
                        return this.preCallAction(request, response, { actionName })
                    })
                    .then(resolve)
                    .catch(error => {
                        reject(error)
                    })
                // response.once('finish', () => resolve(true))
            })
        },
        writeCorsHeaders (route, request, response, isPreflight) {
            if (!route.cors) {
                return
            }

            // Access-Control-Allow-Origin
            if (!route.cors.origin || route.cors.origin === '*') {
                response.setHeader('Access-Control-Allow-Origin', '*')
            } else if (isString(route.cors.origin)) {
                response.setHeader('Access-Control-Allow-Origin', route.cors.origin)
                response.setHeader('Vary', 'Origin')
            } else if (Array.isArray(route.cors.origin)) {
                response.setHeader('Access-Control-Allow-Origin', route.cors.origin.join(', '))
                response.setHeader('Vary', 'Origin')
            }

            // Access-Control-Allow-Credentials
            if (route.cors.credentials === true) {
                response.setHeader('Access-Control-Allow-Credentials', 'true')
            }

            // Access-Control-Expose-Headers
            if (isString(route.cors.exposedHeaders)) {
                response.setHeader('Access-Control-Expose-Headers', route.cors.exposedHeaders)
            } else if (Array.isArray(route.cors.exposedHeaders)) {
                response.setHeader('Access-Control-Expose-Headers', route.cors.exposedHeaders.join(', '))
            }

            if (isPreflight) {
            // Access-Control-Allow-Headers
                if (isString(route.cors.allowedHeaders)) {
                    response.setHeader('Access-Control-Allow-Headers', route.cors.allowedHeaders)
                } else if (Array.isArray(route.cors.allowedHeaders)) {
                    response.setHeader('Access-Control-Allow-Headers', route.cors.allowedHeaders.join(', '))
                } else {
                    // AllowedHeaders aren't specified, so we take the request headers
                    const allowedHeaders = request.headers['access-control-request-headers']
                    if (allowedHeaders) {
                        response.setHeader('Vary', 'Access-Control-Request-Headers')
                        response.setHeader('Access-Control-Allow-Headers', allowedHeaders)
                    }
                }

                // Access-Control-Allow-Methods
                if (isString(route.cors.methods)) {
                    response.setHeader('Access-Control-Allow-Methods', route.cors.methods)
                } else if (Array.isArray(route.cors.methods)) {
                    response.setHeader('Access-Control-Allow-Methods', route.cors.methods.join(', '))
                }

                // Access-Control-Max-Age
                if (route.cors.maxAge) {
                    response.setHeader('Access-Control-Max-Age', route.cors.maxAge.toString())
                }
            }
        },
        createRoute (options) {
            const route = {
                options,
                middlewares: []
            }

            if (options.authorization) {
                if (!isFunction(this.authorize)) {
                    this.log.warn('If yout want to use authorization for this route, please define the "authorize" method in this service.')
                    route.authorization = false
                } else {
                    this.authorize = promisify(this.authorize, { scope: this })
                    route.authorization = true
                }
            }

            if (options.bodyParsers) {
                const bodyParsers = options.bodyParsers
                Object.keys(bodyParsers).forEach(key => {
                    const opts = isObject(bodyParsers[key]) ? bodyParsers[key] : undefined
                    if (bodyParsers[key] !== false) {
                        route.middlewares.push(bodyParser[key](opts))
                    }
                })
            }

            if (this.settings.rateLimit) {
                const opts = Object.assign({
                    windowSizeMs: 5000,
                    limit: 50,
                    headers: false,
                    getKey: (request) => {
                        return request.headers['x-forwarded-for'] ||
                            request.connection.remoteAddress ||
                            request.socket.remoteAddress ||
                            request.connection.socket.remoteAddress
                    }
                }, this.settings.rateLimit)

                route.rateLimit = opts

                if (opts.RateLimitStore) {
                    route.rateLimit.store = new opts.RateLimitStore(opts.windowSizeMs, opts)
                } else {
                    route.rateLimit.store = new MemoryRateLimitStore(opts.windowSizeMs)
                }
            }

            route.path = options.path || '/'
            route.whitelist = options.whitelist
            route.hasWhitelist = Array.isArray(options.whitelist)
            route.mappingPolicy = options.mappingPolicy || this.settings.mappingPolicy || MAPPING_POLICY_ALL

            const middlewares = []
            if (Array.isArray(this.settings.use) && this.settings.use.length > 0) {
                middlewares.push(...this.settings.use)
            }
            if (options.use && Array.isArray(options.use) && options.use.length > 0) {
                middlewares.push(...options.use)
            }
            if (middlewares.length > 0) {
                route.middlewares.push(...middlewares)
                this.log.debug(`${middlewares.length} middlewares registered.`)
            }

            if (this.settings.cors || options.cors) {
                route.cors = Object.assign({
                    origin: '*',
                    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE']
                }, this.settings.cors, options.cors)
            }

            if (isFunction(options.onBeforeCall)) {
                route.onBeforeCall = promisify(options.onBeforeCall, { scope: this })
            }

            if (isFunction(options.onAfterCall)) {
                route.onAfterCall = promisify(options.onAfterCall, { scope: this })
            }

            if (isFunction(options.onError)) {
                route.onError = options.onError
            }

            if (options.aliases && Object.keys(options.aliases).length > 0) {
                route.aliases = []
                const createAliaseRoute = (matchPath, action) => {
                    let method = '*'
                    if (matchPath.indexOf(' ') !== -1) {
                        const parts = matchPath.split(' ')
                        method = parts[0]
                        matchPath = parts[1]
                    }
                    if (matchPath.startsWith('/')) {
                        matchPath = matchPath.slice(1)
                    }
                    const keys = []
                    const regex = pathToRegex(matchPath, keys, {})

                    let alias
                    if (isString(action)) {
                        alias = { actionName: action }
                    } else if (isFunction(action)) {
                        alias = { handler: action }
                    } else if (Array.isArray(action)) {
                        alias = {}
                        const middlewares = compact(action.map(a => {
                            if (isString(a)) {
                                alias.actionName = a
                            } else if (isFunction(a)) {
                                return a
                            }
                        }))
                        alias.handler = this.wrapMiddlewares(middlewares)
                    } else {
                        alias = action
                    }

                    alias.method = method
                    alias.path = matchPath
                    alias.regex = regex

                    alias.match = (url) => {
                        const match = regex.exec(url)
                        if (!match) return false
                        const params = {}
                        for (let i = 0; i < keys.length; i++) {
                            const key = keys[i]
                            const param = match[i + 1]
                            params[key.name] = param
                        }
                        return params
                    }

                    return alias
                }
                Object.keys(options.aliases).forEach((matchPath) => {
                    // todo: check matchpath for REST
                    const action = options.aliases[matchPath]
                    route.aliases.push(createAliaseRoute(matchPath, action))
                })
            }
            return route
        },
        wrapMiddlewares (middlewares) {
            return (request, response, done) => {
                const next = (error, index) => {
                    if (error || index >= middlewares.length) {
                        return done.call(this, error)
                    }
                    middlewares[index].call(this, request, response, error => next(error, index + 1))
                }
                return next(null, 0)
            }
        },
        wrapMiddlewaresPromisified (request, response, middlewares) {
            return new Promise((resolve, reject) => {
                this.wrapMiddlewares(middlewares)(request, response, error => {
                    if (error) {
                        if (error instanceof WeaveError) {
                            return reject(error)
                        }
                        if (error instanceof Error) {
                            return reject(new WeaveError(error.message, error.code || error.state, error.type))
                        }
                        return reject(new WeaveError(error))
                    }
                    resolve()
                })
            })
        },
        processQueryString (request) {
            let url = request.url
            let query = {}
            const questionMarkIndex = url.indexOf('?')
            if (questionMarkIndex !== -1) {
                query = queryString.parse(url.substring(questionMarkIndex + 1))
                url = url.substring(0, questionMarkIndex)
            }
            return { url, query }
        },
        preCallAction (request, response, alias /* actionName, query, route, request, response */) {
            const route = request.$route
            const context = request.$context

            if (alias.actionName && route.hasWhitelist) {
                if (!this.checkWhitelist(route.whitelist, alias.actionName)) {
                    this.log.debug(`Action ${alias.actionName} is not on the whitelist!`)
                    return this.sendError(request, response, new WeaveServiceNotFoundError(alias.actionName))
                }
            }

            if (route.rateLimit) {
                const store = route.rateLimit.store
                const opts = route.rateLimit
                const key = opts.getKey(request)

                if (key) {
                    const remainingRequests = opts.limit - store.increment(key)
                    if (opts.headers) {
                        response.setHeader('X-Rate-Limit-Limit', opts.limit)
                        response.setHeader('X-Rate-Limit-Window', opts.windowSizeMs)
                        response.setHeader('X-Rate-Limit-Remainung', remainingRequests > 0 ? remainingRequests : 0)
                    }

                    if (remainingRequests < 0) {
                        return this.sendError(request, response, new RateLimitExeededError())
                    }
                }
            }

            return Promise.resolve()
                .then(() => {
                    if (alias.actionName) {
                        const endpoint = this.broker.getNextActionEndpoint(alias.actionName)
                        if (endpoint instanceof Error) {
                            return Promise.reject(endpoint)
                        }

                        if (endpoint.action.visibility !== null && endpoint.action.visibility === 'prvate') {
                            throw new WeaveServiceNotFoundError(alias.actionName)
                        }

                        request.$endpoint = endpoint
                        request.$action = endpoint.action
                    }
                })
                .then(() => {
                    if (route.onBeforeCall) {
                        return route.onBeforeCall.call(this, context, route, request, response)
                    }
                })
                .then(() => {
                    if (route.authorization) {
                        return this.authorize(context, request, response)
                    }
                })
                .then(() => {
                    if (isFunction(alias.handler)) {
                        return new Promise((resolve, reject) => {
                            alias.handler.call(this, request, response, error => {
                                if (error) {
                                    reject(error)
                                } else {
                                    resolve()
                                }
                            })
                        })
                    } else if (alias.actionName) {
                        return this.callAction(alias.actionName, request.$params, route, request, response)
                    }
                })
        },
        callAction (actionName, params, route, request, response) {
            // let endpoint
            const context = request.$context

            return Promise.resolve()
                .then(() => this.log.info(`Call action: ${actionName}`))
                .then(() => context.call(actionName, params, {}))
                .then(data => {
                    if (route.onAfterCall) {
                        return route.onAfterCall(context, route, request, response, data)
                    }
                    return data
                })
                .then(data => {
                    this.sendResponse(context, route, request, response, request.$action, data)
                    this.logResponse(request, response, context, data)
                    return true
                })

            // return Promise.resolve()
            //     .then(() => {
            //         if (['POST', 'PUT', 'PATCH'].indexOf(request.method) !== -1 && route.bodyParsers && route.bodyParsers.length > 0) {
            //             return Promise.all(route.bodyParsers.map(parser => {
            //                 return new Promise((resolve, reject) => {
            //                     parser(request, response, error => {
            //                         if (error) {
            //                             return reject(error)
            //                         }
            //                         resolve()
            //                     })
            //                 })
            //             }))
            //         }
            //     })
            //     .then(() => {
            //         const body = isObject(request.body) ? request.body : {}
            //         params = Object.assign(params, body)
            //     })
            //     .then(() => {
            //         endpoint = self.broker.getNextActionEndpoint(actionName)
            //         if (endpoint instanceof Error) {
            //             return Promise.reject(endpoint)
            //         }

            //         if (self.broker.validator && endpoint.action.params) {
            //             self.broker.validator.validate(params, endpoint.action.params)
            //         }
            //         return endpoint
            //     })
            //     .then(endpoint => {
            //         const context = self.broker.contextFactory.createFromEndpoint(endpoint, params)
            //         // context.metricsStart(context.metrics)
            //         if (request.body) {
            //             context.body = request.body
            //         }
            //         return context
            //     })
            //     .then(context => {
            //         if (route.onBeforeCall) {
            //             return route.onBeforeCall(context, route, request, response)
            //                 .then(() => context)
            //         }
            //         return context
            //     })
            //     .then(context => {
            //         if (route.authorization) {
            //             return this.authorize(context, request, response)
            //                 .then(() => context)
            //         }
            //         return context
            //     })
            //     .then(context => {
            //         return context.call(endpoint, params)
            //             .then(data => {
            //                 return Promise.resolve(data)
            //                     .then(data => {
            //                         if (route.onAfterCall) {
            //                             return route.onAfterCall(context, data, request)
            //                         }
            //                         return data
            //                     })
            //                     .then(data => {
            //                         this.sendResponse(response, data)
            //                         // context.metricsFinish(null, context)
            //                         this.logResponse(request, response, context, data)
            //                     })
            //             })
            //     })
            //     .catch(error => {
            //         if (!error) {
            //             return
            //         }

            //         if (error.context) { // todo: add context to errors
            //             response.setHeader('X-Request-Id', error.context.id)
            //         }
            //         self.log.error(`Request error!:`, error.name, ':', error.message, '\n', error.stack, '\nData', error.data)

            //         if (error.context) {
            //             // error.context.metricsFinish(null, error.context.metrics)
            //         }
            //         this.sendError(request, response, error)
            //     })
        },
        sendResponse (context, route, request, response, action, data) {
            let responseType

            if (response.headersSent) {
                this.log.warn('Headers have already sent')
                return
            }

            response.statusCode = 200

            if (context.meta.$statusCode) {
                response.statusCode = context.meta.$statusCode
            }

            if (context.meta.$statusMessage) {
                response.statusMessage = context.meta.$statusMessage
            }

            if (context.meta.$responseType) {
                responseType = context.meta.$responseType
            }

            if (data === null || typeof data === 'undefined') {
                return response.end()
            }
            if (Array.isArray(data)) { // Object
                const body = JSON.stringify(data)
                response.setHeader('Content-Length', Buffer.byteLength(body))
                response.setHeader('Content-Type', responseType || 'application/json')
                response.end(body)
            } else if (isReadableStream(data)) { // Stream
                response.setHeader('Content-Type', responseType || 'application/octet-stream')
                data.pipe(response)
            } else {
                const body = JSON.stringify(data)
                response.setHeader('Content-Length', Buffer.byteLength(body))
                response.setHeader('Content-Type', responseType || 'application/json')
                response.end(body)
            }
        },
        send404 (response) {
            response.writeHead(404)
            response.end('Not found')
        },
        sendError (request, response, error) {
            if (isFunction(request.$route.onError)) {
                return request.$route.onError.call(this, request, response, error)
            }

            if (isFunction(this.settings.onError)) {
                return this.settings.onError.call(this, request, response, error)
            }

            if (!error || !(error instanceof Error)) {
                response.writeHead(500)
                response.end('Internal Server Error')
                // todo: logresponse
                return
            }

            response.setHeader('Content-type', 'application/json; charset=utf-8')
            const code = error.code < 100 ? 500 : error.code || 500
            response.writeHead(code)
            response.end(JSON.stringify({
                name: error.name,
                code: code,
                message: error.message,
                data: error.data
            }, null, 4))
            this.logResponse(request, response, error ? error.context : null)
        },
        checkWhitelist (whitelist, actionName) {
            const actionNameParts = actionName.split('.')
            for (let i = 0; i < whitelist.length; i++) {
                const predicate = whitelist[i]
                if (predicate === actionName) {
                    return true
                }

                if (predicate.indexOf('.') !== -1) {
                    const predicateParts = predicate.split('.')
                    if (predicateParts[1] === '*' && predicateParts[0] === actionNameParts[0]) {
                        return true
                    }
                }
            }
            return false
        },
        resolveAlias (route, urlPath, method) {
            for (let aliasIndex = 0; aliasIndex < route.aliases.length; aliasIndex++) {
                const alias = route.aliases[aliasIndex]
                if (alias.method === '*' || alias.method === method) {
                    const params = alias.match(urlPath)
                    if (params) {
                        return {
                            alias,
                            params: params
                        }
                    }
                }
            }
            return false
        },
        logRequest (request, response, context) {
            let duration = ''
            if (context && context.metrics) {
                if (context.duration > 1000) {
                    duration = `[${Number(context.duration / 1000).toFixed(3)} s]`
                } else {
                    duration = `[${Number(context.duration).toFixed(3)} ms]`
                }
            }
            this.log.info(`<= ${response.statusCode} ${request.method} ${request.url} ${duration}`)
        },
        logResponse (request, response, context, data) {
            let duration = ''
            if (context && context.metrics) {
                if (context.duration > 1000) {
                    duration = `[${Number(context.duration / 1000).toFixed(3)} s]`
                } else {
                    duration = `[${Number(context.duration).toFixed(3)} ms]`
                }
            }
            this.log.info(`<= ${response.statusCode} ${request.method} ${request.url} ${duration}`)
        }
    },
    created () {
        if (this.settings.https && this.settings.https.key && this.settings.https.cert) {
            this.server = spdy.createServer(this.settings.https, this.handleRequest)
            this.isHttps = true
        } else {
            this.server = http.createServer(this.handleRequest)
            this.isHttps = false
        }

        this.server.on('error', error => {
            this.log.error('Server error', error)
        })

        if (this.settings.routeCache) {
            this.routeCache = {}
        }

        // Create static file server middleware
        if (this.settings.assets) {
            const options = this.settings.assets.options || {}
            this.serve = serveStatic(this.settings.assets.folder, options)
        }

        // Process routes
        if (this.settings.routes) {
            this.routes = this.settings.routes.map(route => this.createRoute(route))
        }

        this.log.info(`API Gateway created.`)
    },
    started () {
        this.server.listen(this.settings.port, this.settings.ip, error => {
            if (error) {
                this.log.error('API Listening error', error)
            }
            const address = this.server.address()
            this.log.info(`API Gateway listening on ${this.isHttps ? 'https' : 'http'}://${address.address}:${address.port}`)
        })
    },
    stopped () {
        this.server.close()
    }
}
