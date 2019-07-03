const { existsSync } = require('fs')
const { join } = require('path')

const castArray = (obj) => Array.isArray(obj) ? obj : [obj]

module.exports = (mixinOptions) => {
    mixinOptions = Object.assign({
        routeOptions: {
            path: '/graphql'
        },
        outputSchema: false
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
        actions: {
            send: {
                params: {
                    message: { type: 'object' },
                    data: { type: 'object', optional: true }
                },
                handler (context) {
                    const { message } = context.params
                    // if (message.template) {
                    //     if (this.templateFileNotExists(message.template)) {
                    //         return Promise.reject(new WeaveError(`Email template is missing: ${message.template}`))
                    //     }
                    // }
                    return this.send(message)
                }
            }
        },
        methods: {
            prepareGraphQLSchema () {
                if (isSchemaValid) {
                    return
                }

                const services = this.broker.registry.services.list({ withActions: true, withSettings: true })
                const schema = this.generateGraphQLSchema(services)

                // isSchemaValid = true
            },
            invalidateGraphQLSchema () {
                isSchemaValid = false
            },
            generateGraphQLSchema (services) {
                let types = []

                services.map(service => {
                    if (service.settings.graphql) {
                        const globalGraphqlDefs = service.settings.graphql

                        if (globalGraphqlDefs.types) {
                            types = types.concat(globalGraphqlDefs.types)
                        }
                    }

                    const resolvers = {}
                    Object.values(service.actions).map(action => {
                        const { graphql: def } = action
                        // todo: check if def is an object
                        if (def) {
                            if (def.query) {
                                if (!resolvers['Query']) {
                                    resolvers['Query'] = {}
                                }
                                castArray(def.query).map(query => {

                                }) 
                            }
                            console.log(def)
                        }
                    })

                    console.log(service)
                })
            },
            graphqlHandler (request, response) {
                return response.end('Sss')
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
