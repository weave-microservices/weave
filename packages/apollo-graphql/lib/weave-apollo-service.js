const fs = require('fs')
const { join } = require('path')
const { makeExecutableSchema } = require('graphql-tools')
const WeaveApolloServer = require('./weave-apollo-server')
const { printSchema } = require('graphql')
const { isPlainObject, merge } = require('./utils')

const castArray = (obj) => Array.isArray(obj) ? obj : [obj]

module.exports = (mixinOptions) => {
    mixinOptions = Object.assign({
        routeOptions: {
            path: '/graphql'
        },
        generateSnapshot: true,
        snapshotPath: `${process.cwd()}/schema.snapshot.graphql`,
        customTypes: {},
        resolvers: {},
        typeDefs: [],
        serverOptions: {
            playground: false
        }
    }, mixinOptions)

    let isSchemaValid = false

    const mixinSchema = {
        name: 'graphql',
        settings: {
            transport: null,
            from: null
        },
        events: {
            '$services.changed' () {
                this.invalidateGraphQLSchema()
            }
        },
        methods: {
            prepareGraphQLSchema () {
                if (isSchemaValid) {
                    return
                }

                this.log.info(`Created Graphql schema.`)

                const services = this.broker.registry.services.list({ withActions: true, withSettings: true })
                this.schema = this.generateGraphQLSchema(services)

                if (mixinOptions.generateSnapshot) {
                    this.createSnapshot()
                }

                this.apolloServer = new WeaveApolloServer(merge(mixinOptions.serverOptions, {
                    schema: this.schema,
                    context: ({ req, connection }) => {
                        return req ? {
                            context: req.$context,
                            service: req.$service,
                            params: req.$params
                        } : {
                            service: connection.$service
                        }
                    }
                }))

                this.graphqlHandler = this.apolloServer.createHandler()

                isSchemaValid = true
            },
            invalidateGraphQLSchema () {
                isSchemaValid = false
            },
            generateGraphQLSchema (services) {
                try {
                    const typeDefs = [].concat(mixinOptions.typeDefs)
                    const queries = []
                    const schemaDirectives = null
                    const mutations = []
                    const enums = []
                    let resolvers = Object.assign({}, mixinOptions.resolvers)
                    let types = []

                    services.map(service => {
                        if (service.settings.graphql) {
                            const globalGraphqlDefs = service.settings.graphql

                            if (globalGraphqlDefs.type) {
                                types = types.concat(globalGraphqlDefs.type)
                            }

                            if (globalGraphqlDefs.resolvers) {
                                resolvers = Object.entries(globalGraphqlDefs.resolvers)
                                    .reduce((a, [name, res]) => {
                                        a[name] = merge(
                                            a[name] || {},
                                            this.createServiceResolver(service.name, res)
                                        )
                                        return a
                                    }, resolvers)// types.concat(globalGraphqlDefs.type)
                            }
                        }

                        const resolver = {}
                        Object.values(service.actions).map(action => {
                            const { graphql: definitions } = action

                            if (definitions) {
                                if (definitions.query) {
                                    if (!resolver['Query']) {
                                        resolver['Query'] = {}
                                    }
                                    castArray(definitions.query).map(query => {
                                        const name = query.trim().split(/[(:]/g)[0].trim()
                                        queries.push(query)
                                        resolver.Query[name] = this.createActionResolver(action.name)
                                    })
                                }

                                if (definitions.mutation) {
                                    if (!resolver['Mutation']) {
                                        resolver['Mutation'] = {}
                                    }
                                    castArray(definitions.mutation).map(mutation => {
                                        const name = mutation.trim().split(/[(:]/g)[0].trim()
                                        mutations.push(mutation)
                                        resolver.Mutation[name] = this.createActionResolver(action.name)
                                    })
                                }

                                if (definitions.subscription) {

                                }
                            }
                        })

                        if (Object.keys(resolver).length > 0) {
                            resolvers = merge(resolvers, resolver)
                        }
                    })

                    if (queries.length > 0 ||
                        types.length > 0) {
                        let queryString = ''

                        if (queries.length > 0) {
                            queryString += `
                                type Query {
                                    ${queries.join('\n')}
                                }
                            `
                        }

                        if (mutations.length > 0) {
                            queryString += `
                                type Mutation {
                                    ${mutations.join('\n')}
                                }
                            `
                        }

                        if (types.length > 0) {
                            queryString += `
                                    ${types.join('\n')}
                            `
                        }

                        if (enums.length > 0) {
                            queryString += `
                                    ${enums.join('\n')}
                            `
                        }

                        typeDefs.push(queryString)
                    }

                    return makeExecutableSchema({ typeDefs, resolvers, schemaDirectives })
                } catch (error) {
                    this.log.error(error)
                }
            },
            createServiceResolver (serviceName, resolvers) {
                return Object.entries(resolvers).reduce((a, [p, resolver]) => {
                    if (isPlainObject(resolver) && resolver.action) {
                        a[p] = this.createActionResolver(resolver.action, resolver)
                    }
                    return a
                //    a[]
                //     return a
                }, {})
            },
            createActionResolver (actionName, p) {
                return async (root, params, context) => {
                    try {
                        if (p && p.rootParams) {
                            params = Object.entries(p.rootParams).reduce((params, [rootParam, targetParam]) => {
                                const rootVal = root[rootParam]
                                params[targetParam] = rootVal
                                return params
                            }, params || {})
                        }
                        return context.context.call(actionName, params)
                    } catch (error) {
                        return error
                    }
                }
            },
            createSnapshot () {
                if (this.schema) {
                    fs.writeFileSync(mixinOptions.snapshotPath, printSchema(this.schema))
                }
            }
        },
        created () {
            const graphqlRoute = Object.assign({
                aliases: {
                    '/' (request, response) {
                        try {
                            this.prepareGraphQLSchema()
                            return this.graphqlHandler(request, response)
                        } catch (error) {
                            this.sendError(request, response, error)
                        }
                    }
                },
                mappingPolicy: 'restrict',
                bodyParsers: {
                    json: true,
                    urlencoded: { extended: true }
                }
            }, mixinOptions.routeOptions)

            this.settings.routes.unshift(graphqlRoute)
        }
    }

    return mixinSchema
}
